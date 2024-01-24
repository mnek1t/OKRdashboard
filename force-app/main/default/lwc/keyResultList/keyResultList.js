import { LightningElement,api,track } from 'lwc';
//apex methods
import getKeyResults from '@salesforce/apex/KeyResultHandler.getKeyResults';
const RELATED_FIELD_OPTION = ['Opportunity', 'Google Review', 'Review', 'Case Study', 'Act', 'Survey', 'Call','Event', 'Leads (Web)']
export default class KeyResultList extends LightningElement 
{
    @api keyResultId; //parameter from objectivityList component to retrieve all key results
    @api trackedFields= [];
    @track keyResults; //contains all keyresult
    @track showTargetWindow=false; // open SetTarget Window
    @track relatedFieldsOptions; // array store all related fields 
    @track targets; // contain key-value pair: RelatedObj-amout of these objects conneted with one keyResult
    //autolaunched methods
    connectedCallback(){
       this.loadKeyresults();
    }
    //get keyResult by its id and get all options for checkboxgroup
    async loadKeyresults(){
        try{
        this.keyResults = await getKeyResults({keyResultId: this.keyResultId}); //responible for getting all keyResult records
        this.relatedFieldsOptions = RELATED_FIELD_OPTION.map(field=>({ label: field, value: field }));
        }
        catch(error){
            console.log('load keyResults error: ',JSON.stringify(error));
        }
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
        try {
            this.targets = await Promise.all (this.trackedFields.map(async field => {
                let value = await this.getAmountOfRelatedField(field);
                return {label: field, value: value};
            }));
        } catch (error) {
            console.log('handleSetTargetFields error: ',JSON.stringify(error));
        }
    }
    //handler of checked boxes changes  
    handleSelectedTargetFieldOption(event){
        this.trackedFields = event.detail.value;
        this.targetedFields = event.detail.value
    }
    // returns count of records in objects that relate to particular keyResult record  
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
    }
}