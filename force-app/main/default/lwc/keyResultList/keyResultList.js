import { LightningElement,api,track,wire } from 'lwc';
//apex methods
import getKeyResults from '@salesforce/apex/KeyResultHandler.getKeyResults';
import updateKeyResultProgress from '@salesforce/apex/KeyResultHandler.updateKeyResultProgress'
import getContractTypes from '@salesforce/apex/ContractsHandler.getContractTypes';
//import saveTargets from '@salesforce/apex/TargetsHandler.saveTargets';
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
    strOfTargets = ''; //string of target labels
    strOfAmoutTarget = ''; //string of amount of targets
    strOfContractTypes = '';
    @track TARGETS//containt retrieved targets 
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
        console.log(JSON.stringify(this.recievedTargets))
        //use data model approach
        if(this.recievedTargets.length > 0)
        {
            this.strOfTargets = this.recievedTargets[0].Name;
            this.strOfAmoutTarget = this.recievedTargets[0].ToAchieve__c;
            //this.recievedTargets[0].Completed__c = parseInt(await this.getAmountOfRelatedField(this.recievedTargets[0].Name));
            //console.log('COmleted__c', this.recievedTargets[0].Completed__c);
            //console.log(JSON.stringify(await this.getAmountOfRelatedField(this.recievedTargets[0].Name)))
            //console.log('this.strOfTargets',this.strOfTargets)
            //console.log('this.strOfAmoutTarget',this.strOfAmoutTarget)
            this.keyResults = await getKeyResults({keyResultId: this.keyResultId, contractType: null});
            //this.recievedTargets[0].Completed__c = parseInt(await this.getAmountOfRelatedField(this.recievedTargets[0].Name));
            //console.log(JSON.stringify(await this.getAmountOfRelatedField(this.recievedTargets[0].Name)))
            // if('ContractTypes__c' in this.recievedTargets[0])
            // {
            //     this.strOfContractTypes =  this.recievedTargets[0].ContractTypes__c;
            //     this.keyResults = await getKeyResults({keyResultId: this.keyResultId, contractType: this.strOfContractTypes});
            // }
            // else this.keyResults = await getKeyResults({keyResultId: this.keyResultId, contractType: null});
          
            // let listOfTargets = this.strOfTargets.split(',');
            // let listOfTargetsAmount = this.strOfAmoutTarget.split(' ');

            // let targetWithAmount = {};
            // for (let i = 0; i < listOfTargets.length; i++) {
            //     targetWithAmount[listOfTargets[i]] = listOfTargetsAmount[i];
            // }
            // let sumofCompletedTargets = 0;
            // this.TARGETS  = await Promise.all(Object.entries(targetWithAmount).map(async ([label, desiredAmount]) => {
            //     let completedTarget = await this.getAmountOfRelatedField(label); 
            //     sumofCompletedTargets = sumofCompletedTargets + parseInt(completedTarget);
            //     return {targetLabel: label, completedTarget : completedTarget, desiredTarget: desiredAmount }
            // }));
            // let sumOfTargets = listOfTargetsAmount.map(Number).reduce((a,b) => a+b, 0);
            // this.keyResults  = await updateKeyResultProgress({sumOfTargets:sumOfTargets, keyResults: this.keyResults, sumofCompletedTargets: sumofCompletedTargets});
        }
        else{
            this.keyResults = await getKeyResults({keyResultId: this.keyResultId, contractType: null});
        }
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
        let targetFromDictionary;
        try {
            //current related fields
            await Promise.all (this.trackedFields.map(async field => {
                this.strOfTargets = this.strOfTargets + field;
                targetFromDictionary = this.dictionary[field] !==-1 ? this.dictionary[field] : 0;
                this.strOfAmoutTarget = this.strOfAmoutTarget + targetFromDictionary + ' ';
            }));
            this.strOfTargets = this.strOfTargets.replace(/(?<=[a-z|\)])(?=[A-Z])/g, ',');
            this.strOfAmoutTarget = this.strOfAmoutTarget.slice(0,-1);
            if(this.strOfTargets.trim()){
                const listOfTargets = this.strOfTargets.split(',');
                const listOfTargetsAmount = this.strOfAmoutTarget.split(' ');
                
                let targetWithAmount = {};
                for (let i = 0; i < listOfTargets.length; i++) {
                    targetWithAmount[listOfTargets[i]] = listOfTargetsAmount[i];
                }
                this.TARGETS  = await Promise.all(Object.entries(targetWithAmount).map(async ([label, desiredAmount]) => {
                    const completedTargetValue = await this.getAmountOfRelatedField(label);
                    this.completedTarget.push(completedTargetValue); 
                    return {targetLabel: label, completedTarget : this.completedTarget, desiredTarget: desiredAmount }
                }));
                console.log('completedTarget',JSON.stringify(listOfTargets))
                console.log('completedTarget',JSON.stringify(this.completedTarget))
                console.log('this.contracttype',this.contractType)
                setTarget({targets: listOfTargets, amount : listOfTargetsAmount,completedTarget: this.completedTarget , keyResultId: this.keyResultId, contractType: this.contractType});
            }
            
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