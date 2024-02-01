import { LightningElement,api,track,wire } from 'lwc';
//apex methods
import getKeyResults from '@salesforce/apex/KeyResultHandler.getKeyResults';
import updateKeyResultProgress from '@salesforce/apex/KeyResultHandler.updateKeyResultProgress'
import getContractTypes from '@salesforce/apex/ContractsHandler.getContractTypes';
const RELATED_FIELD_OPTION = ['Opportunity', 'Google Review', 'Review', 'Case Study', 'Act', 'Survey', 'Call','Event', 'Leads (Web)','Contract']
export default class KeyResultList extends LightningElement 
{
    @api keyResultId; //parameter from objectivityList component to retrieve all key results
    @api trackedFields= [];
    @track keyResults; //contains all keyresult
    @track showTargetWindow=false; // open SetTarget Window
    @track relatedFieldsOptions; // array store all related fields 
    @track targets; // contain key-value pair: RelatedObj-amout of these objects conneted with one keyResult
    //retrive data in field from user input
    @track opportunityTarget = -1;
    @track reviewTarget = -1;
    @track googleReviewTarget = -1;
    @track surveyTarget = -1;
    @track caseStudyTarget = -1;
    @track callTarget = -1;
    @track actTarget = -1;
    @track leadTarget = -1;
    @track eventTarget = -1;
    @track contractTarget = -1
    @track savedTargets; // download from localStorage 
    
    //particular for case when Contract is checked as a Target 
    @track showPicklist = false;
    @track contractType;

    @track targetedFields=[];
    @track targetedFieldsWithContracts = [];
    //collection contains: key - option name, chosen in SetTargetWinodow and value - input
    @track dictionary = {
        'Opportunity': this.opportunityTarget,
        'Review': this.reviewTarget,
        'Google Review': this.googleReviewTarget,
        'Act': this.actTarget,
        'Leads (Web)': this.leadTarget,
        'Case Study': this.caseStudyTarget,
        'Call': this.callTarget,
        'Event': this.eventTarget,
        'Survey': this.surveyTarget,
        'Contract': this.contractTarget
    }
    //autolaunched methods
    connectedCallback(){
       let result = JSON.parse(localStorage.getItem(this.keyResultId));
       this.loadKeyResults(result);
       this.loadPicklist();
    }
    //get keyResult by its id and get all options for checkboxgroup
    async loadKeyResults(result){
        try{
        //console.log('result', JSON.stringify(result))
        if(result && result.length > 0){
            if('contractType' in result[0]){
                //console.log('CONTRACT TYPE FOUND:',result[0].contractType); 
                this.keyResults = await getKeyResults({keyResultId: this.keyResultId, contractType : result[0].contractType});
            }
            else {
                this.keyResults = await getKeyResults({keyResultId: this.keyResultId, contractType: null});
            }
        }
        else{
            this.keyResults = await getKeyResults({keyResultId: this.keyResultId, contractType: null});
        }
        this.relatedFieldsOptions = RELATED_FIELD_OPTION.map(field=>({ label: field, value: field }));
        
        let sumOfTargets = 0;
        let listOfTargets = [];
        let sumofCompletedTargets = 0;
        if(result!==null){
            this.savedTargets = await Promise.all (result.map(async item => {
                let value = await this.getAmountOfRelatedField(item.label);
                sumOfTargets = sumOfTargets + parseInt(item.setTarget);
                listOfTargets.push(item.label.toString());
                sumofCompletedTargets = sumofCompletedTargets + value; 
                return {label: item.label, value: value, setTarget: item.setTarget, contractType: item.contractType};
           }))
            this.keyResults  = await updateKeyResultProgress({sumOfTargets:sumOfTargets, keyResults: this.keyResults, sumofCompletedTargets: sumofCompletedTargets});
        }
        }
        catch(error){
            console.log('load keyResults error: ',JSON.stringify(error));
        }
    }
    @track contractTypeOptions;
    //retrieve all values from picklist 
    async loadPicklist(){
        let result = await getContractTypes();
        this.contractTypeOptions = result.map(picklistValue=>({
            label: picklistValue, value: picklistValue
        }));
    }

    //handler for opening window with related fields
    handleSetTargetsWindow(event)
    {
        if(event.target.value == 'config')
            this.showTargetWindow = true;
        else
            this.showTargetWindow = false;
    }
    //hadler of Set button that will 'subscribe' on fields that need to be tracked to complete Key result
    async handleSetTargetFields(){
        this.showTargetWindow = false; 
        let value; let targetFromDictionary;
        try {
            //current related fields
            this.targets = await Promise.all (this.trackedFields.map(async field => {
                value = await this.getAmountOfRelatedField(field);
                targetFromDictionary = this.dictionary[field] !==-1 ? this.dictionary[field] : 0;
                return {label: field, value: value, setTarget: targetFromDictionary,contractType: this.contractType};
            }));
            localStorage.setItem(this.keyResultId,JSON.stringify(this.targets));
        } catch (error) {
            console.log('handleSetTargetFields error: ',error);
        }
    }

    //handler of checked boxes changes 
    handleSelectedTargetFieldOption(event){
        this.trackedFields = event.detail.value;
        this.targetedFields = [...this.trackedFields]; // update targetedFields 

        // delete elements from  targetedFieldsWithContract if it is not checked
        this.targetedFieldsWithContracts = this.targetedFieldsWithContracts.filter(field => this.trackedFields.includes(field.value));

        //Add new elements targetedFieldsWithContracts
        for(let a of this.trackedFields){
            if(!this.targetedFieldsWithContracts.some(field => field.value === a)){
                this.targetedFieldsWithContracts.push({
                    value: a,
                    isContract: a === 'Contract'
                });
            }
        }
    } 
    //retrive a value from user input
    handlerSetTarget(event){
        this.dictionary[event.target.name] = event.target.value;
    }
    //handle contract targeting
    handleSelectedTypeContract(event){
        this.contractType = event.detail.value;
    }
    //retrieve actual amount of related field in Key Result 
    async getAmountOfRelatedField(field){ 
        let fieldMapping = {
            'Opportunity': 'Opportunities__r',
            'Event': 'Events',
            'Leads (Web)': 'Leads__r',
            'Google Review': 'Google_Reviews__r',
            'Review': 'Reviews__r',
            'Act': 'Acts__r',
            'Call': 'Calls__r',
            'Case Study': 'Case_Studies__r',
            'Survey': 'Surveys__r',
            'Contract': 'Contracts__r'
        };
    
        if(fieldMapping[field]) {
            let counts = await Promise.all(this.keyResults.map(async keyResult => {
                if(keyResult && Array.isArray(keyResult[fieldMapping[field]]))
                    return keyResult[fieldMapping[field]].length;
                else 
                    return 0;   
            }));
            return counts.reduce((a, b) => a + b, 0);
        }
    }
}