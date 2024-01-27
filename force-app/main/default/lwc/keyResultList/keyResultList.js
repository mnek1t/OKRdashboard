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
    //пробую собрать значения с полей 
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
    
    @track showPicklist = false;
    @track contractType;
    //коллекция которая хранит в себе ключ это имя опции выбраная в SetTargetWinodow и значение которое будет изменятся при вводе input
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
       this.loadKeyresults(result);
       this.loadPicklist();
    }
    //get keyResult by its id and get all options for checkboxgroup
    async loadKeyresults(result){
        try{
        console.log('result', JSON.stringify(result))
        if(result && result.length > 0){
            if('contractType' in result[0]){
                console.log('CONTRACT TYPE FOUND:',result[0].contractType); // точно не пустой
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
        }
        catch(error){
            console.log('load keyResults error: ',error);
        }
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
           //console.log('я передам такие параметры: sumofTargets:', sumOfTargets,'keyresults:',JSON.stringify(this.keyResults),'ļistOfTargets' ,JSON.stringify(listOfTargets),'для id', this.keyResultId );
           this.keyResults = await updateKeyResultProgress({sumOfTargets:sumOfTargets, keyResults: this.keyResults, sumofCompletedTargets: sumofCompletedTargets});
        }
    }
    @track contractTypeOptions;
    //retrieve all values from picklist 
    async loadPicklist(){
        let result = await getContractTypes();
        //console.log('result from picklists', JSON.stringify(result));
        this.contractTypeOptions = result.map(picklistValue=>({
            label: picklistValue, value: picklistValue
        }));
        //console.log('contractTypeOptions: ', JSON.stringify(this.contractTypeOptions));
    }

    //handler for opening window with related fields
    handleSetTargetsWindow(event)
    {
        if(event.target.value == 'config')
            this.showTargetWindow = true;
        else
            this.showTargetWindow = false;
    }
    //hadler of Set buuton that will 'subscribe' on fields that need to be tracked to complete Key result
    async handleSetTargetFields(){
        this.showTargetWindow = false; 
        let value; let targetFromDictionary;
        try {
            //current related fields
            this.targets = await Promise.all (this.trackedFields.map(async field => {
                value = await this.getAmountOfRelatedField(field);
                targetFromDictionary = this.dictionary[field] !==-1 ? this.dictionary[field] : 0;
                console.log('contract type in handleSetTargetFields',this.contractType,'isundefined?:',this.contractType==null);
                return {label: field, value: value, setTarget: targetFromDictionary,contractType: this.contractType};
            }));
            localStorage.setItem(this.keyResultId,JSON.stringify(this.targets));
        } catch (error) {
            console.log('handleSetTargetFields error: ',error);
        }
    }
    @track targetedFields=[];
    @track targetedFieldsWithContracts = [];
    //handler of checked boxes changes 
    handleSelectedTargetFieldOption(event){
        this.trackedFields = event.detail.value;
        this.targetedFields = [...this.trackedFields]; // обновляем targetedFields
    
        // Удаляем элементы из targetedFieldsWithContracts, если они больше не отмечены
        this.targetedFieldsWithContracts = this.targetedFieldsWithContracts.filter(field => this.trackedFields.includes(field.value));
    
        // Добавляем новые элементы в targetedFieldsWithContracts
        for(let a of this.trackedFields){
            if(!this.targetedFieldsWithContracts.some(field => field.value === a)){
                this.targetedFieldsWithContracts.push({
                    value: a,
                    isContract: a === 'Contract'
                });
            }
        }
    } 
    async getAmountOfRelatedField(field){ 
        if(field=='Opportunity') {
            return Promise.all(this.keyResults.map(async keyResult => {
                if(keyResult && Array.isArray(keyResult.Opportunities__r))
                    return keyResult.Opportunities__r.length;
                else return 0;
            }));
        }
        if(field=='Event'){
            return Promise.all(this.keyResults.map(async keyResult => {
                if(keyResult && Array.isArray(keyResult.Events))
                    return keyResult.Events.length;
                else return 0;  
            }));
        }
        if(field=='Leads (Web)'){
            return Promise.all(this.keyResults.map(async keyResult => {
                if(keyResult && Array.isArray(keyResult.Leads__r))
                    return keyResult.Leads__r.length;
                else return 0;   
            }));
        }
        if(field=='Google Review'){
            return Promise.all(this.keyResults.map(async keyResult => {
                if(keyResult && Array.isArray(keyResult.Google_Reviews__r))
                    return keyResult.Google_Reviews__r.length;
                else 
                    return 0;   
            }));
        }
        if(field=='Review'){
            return Promise.all(this.keyResults.map(async keyResult => {
                if(keyResult && Array.isArray(keyResult.Reviews__r))
                    return keyResult.Reviews__r.length;
                else 
                    return 0;   
            }));
        }
        if(field=='Act'){
            return Promise.all(this.keyResults.map(async keyResult => {
                if(keyResult && Array.isArray(keyResult.Acts__r))
                    return keyResult.Acts__r.length;
                else 
                    return 0;   
            }));
        }
        if(field=='Call'){
            return Promise.all(this.keyResults.map(async keyResult => {
                if(keyResult && Array.isArray(keyResult.Calls__r))
                    return keyResult.Calls__r.length;
                else 
                    return 0;   
            }));
        }
        if(field=='Case Study'){
            return Promise.all(this.keyResults.map(async keyResult => {
                if(keyResult && Array.isArray(keyResult.Case_Studies__r))
                    return keyResult.Case_Studies__r.length;
                else 
                    return 0;   
            }));
        }
        if(field=='Survey'){
            return Promise.all(this.keyResults.map(async keyResult => {
                if(keyResult && Array.isArray(keyResult.Surveys__r))
                    return keyResult.Surveys__r.length;
                else 
                    return 0;   
            }));
        }
        if(field=='Contract'){
            return Promise.all(this.keyResults.map(async keyResult => {
                if(keyResult && Array.isArray(keyResult.Contracts__r))
                    return keyResult.Contracts__r.length;
                else 
                    return 0;   
            }));
        }
    }
    handlerSetTarget(event){
        this.dictionary[event.target.name] = event.target.value;
    }
    handleSelectedTypeContract(event){
        this.contractType = event.detail.value;
        console.log('hadle change from picklist, value =:', this.contractType)
    }
}