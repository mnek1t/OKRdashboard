import { LightningElement,track,wire,api } from 'lwc';
//apex classes
import createObjective from '@salesforce/apex/ObjectivesHandler.createObjective';
import createKeyResult from '@salesforce/apex/KeyResultHandler.createKeyResult';
import getObjectivitiesOptions from '@salesforce/apex/ObjectivesHandler.getObjectivitiesOptions';

import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import USER_ID from '@salesforce/user/Id';

export default class Okr extends LightningElement 
{ 
    @api userOptions = []; //all users in org
    @api isRefresh = false;
    @track formData= {}
    @track relatedFieldsOptions = [];
    @track objectivityOptions = [];
    @track progressOptions = []
    @track isAddingObjectivity = false;
    @track isAddingKeyResult = false;
    @track objectivityYear = new Date().getFullYear();

    @track trackFields = [];
    //automatically called function
    connectedCallback() {
        this.loadOptions();
    }
    //retrieve all active users in the org
    async loadOptions(){
        try{
        let result = await getObjectivitiesOptions();
        this.objectivityOptions = result;
        }
        catch(error){
            console.log('Erorr')
            console.log(error.message)
        }
        let relatedFields = ['Opportunity', 'Google Review', 'Review', 'Case Study', 'Act', 'Survey', 'Call','Event', 'Leads']
        this.relatedFieldsOptions = relatedFields.map(field=>({ label: field, value: field }));
    }
    handleOpening(event){
        if(event.target.value == 'close'){
            this.isAddingObjectivity = false; 
            this.isAddingKeyResult = false; 
        }
        else if(event.target.value == 'addObj'){
            this.isAddingObjectivity = true;  
        }
        else{
            this.isAddingKeyResult = true;
        }
    }
    //record data
    handleSelectedOption(event){
        this.value = event.detail.value;
        this.trackFields = event.detail.value;
        console.log(this.value)
        console.log(this.trackFields)
    }
    async handleSubmit(event){
        for(let prop in this.refs){
             this.formData[prop] = this.refs[prop].value
        }
        try{
            if(event.target.innerText == 'Create Key'){
                await createKeyResult({
                    keyResultName: this.formData['keyResultName'],
                    objectivityId: this.formData['objectivityId']
                })
                const fetchChechedTrackedFieldsEvent = new CustomEvent('fetchTrackFields', {detail: this.value})
                this.dispatchEvent(fetchChechedTrackedFieldsEvent);
                this.isAddingKeyResult = false;
            }
            else{
                await createObjective({
                    objName: this.formData['objectiveName'], 
                    description: this.formData['description'], 
                    startDate: this.formData['startDate'], 
                    endDate: this.formData['endDate'],  
                    userIdAssigned: this.formData['userId'],  
                })
                this.isAddingObjectivity = false;  
            }
            console.log('Record is created')
            // this.isRefresh = true;
            //this.dispatchEvent(new Event('refresh'));
        }
        catch(error){
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error creating record',
                    message: error.message,
                    variant: 'error',
                }),
            );
        }
    }
}