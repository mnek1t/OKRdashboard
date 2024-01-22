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
    @track formData= {}
    @track relatedFieldsOptions = [];
    @track objectivityOptions = [];
    @track isAddingObjectivity = false;
    @track isAddingKeyResult = false;
    @track assignedUserObjectivities = USER_ID;
    @track objectivityYear = new Date().getFullYear();
    @track checkBoxValue = ['Opportunity'];
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
        //console.log('2relatedFieldsOptions', this.relatedFieldsOptions)
    }
    // @wire(getObjectivitiesOptions)
    // wiredObjectivitieOptions({error,data}){
    //     if(data){
    //         this.objectivityOptions = [...data];
    //         console.log(this.objectivityOptions)
    //     }
    //     else if(error){
    //         console.log('WIRED' + error)
    //     }
    // }  
    // handleSelectedOption(event){
    //     this.value = event.detail.value;
    //     console.log(this.value)
    // }
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
    async handleSubmit(event){
        console.log('event', event)
        for(let prop in this.refs){
             this.formData[prop] = this.refs[prop].value
        }
        console.log('1',JSON.stringify(this.formData))
        try{
            if(event.target.innerText == 'Create Key'){
                await createKeyResult({
                    keyResultName: this.formData['keyResultName'],
                    objectivityId: this.formData['objectivityId']
                })
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
            console.log('Record is created.');
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