import { LightningElement,api,track,wire } from 'lwc';
//apex methods
import getKeyResults from '@salesforce/apex/KeyResultHandler.getKeyResults';
import getContractTypes from '@salesforce/apex/ContractsHandler.getContractTypes';
import getTargets from '@salesforce/apex/TargetsHandler.getTargets';
import setTarget from '@salesforce/apex/TargetsHandler.setTarget';

const RELATED_FIELD_OPTION = ['Opportunity', 'Google Review', 'Review', 'Case Study', 'Act', 'Survey', 'Call','Event', 'Leads (Web)','Contract']
export default class KeyResultList extends LightningElement 
{
    @api keyResultId; //parameter from objectivityList component to retrieve all key results
    @api trackedFields= [];
    @track keyResults; //contains all keyresult
    @track showTargetWindow=false; // open SetTarget Window
    @track relatedFieldsOptions; // array store all related fields 
    //retrive data in field from user input
    opportunityTarget = -1;
    reviewTarget = -1;
    googleReviewTarget = -1;
    surveyTarget = -1;
    caseStudyTarget = -1;
    callTarget = -1;
    actTarget = -1;
    leadTarget = -1;
    eventTarget = -1;
    contractTarget = -1
    
    //particular for case when Contract is checked as a Target 
    @track showPicklist = false;
    @track contractType;

    @track targetedFields=[];
    @track targetedFieldsWithContracts = [];

    //retrive data about targets
    @track recievedTargets;
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
       this.loadKeyResults();
       this.loadPicklist();
    }
    //get keyResult by its id and get all options for checkboxgroup
    async loadKeyResults(){
        try{
        this.recievedTargets = await getTargets({keyResultId: this.keyResultId});
        this.relatedFieldsOptions = RELATED_FIELD_OPTION.map(field=>({ label: field, value: field }));
        if(this.recievedTargets.length > 0 && this.recievedTargets[0].ContractType__c)
        {
            this.keyResults = await getKeyResults({keyResultId: this.keyResultId, contractType: this.recievedTargets[0].ContractType__c});
        }
        else this.keyResults = await getKeyResults({keyResultId: this.keyResultId, contractType : null});
        }
        catch(error){
            console.log('load keyResults error: ',JSON.parse(error));
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
    //handler of Set button that will 'subscribe' on fields that need to be tracked to complete Key result
    @track completedTarget = [];
    async handleSetTargetFields(){
        this.showTargetWindow = false; 
        let targetFromDictionary = [];
        try {
            //current related fields
            await Promise.all (this.trackedFields.map(async field => {
                targetFromDictionary.push(this.dictionary[field]>0 ? this.dictionary[field] : 1);
                const completedTargetValue = await this.getAmountOfRelatedField(field);
                this.completedTarget.push(completedTargetValue); 
            }));
            await setTarget({
                targets: this.trackedFields, amount : targetFromDictionary, completedTarget: this.completedTarget, 
                keyResultId: this.keyResultId, contractType: this.contractType});
            this.recievedTargets = await getTargets({keyResultId: this.keyResultId});
        } catch (error) {
            console.log('handleSetTargetFields error: ', error.message);
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