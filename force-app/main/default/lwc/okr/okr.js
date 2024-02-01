import { LightningElement,track,wire,api } from 'lwc';
//apex classes
import createObjective from '@salesforce/apex/ObjectivesHandler.createObjective';
import createKeyResult from '@salesforce/apex/KeyResultHandler.createKeyResult';
import getObjectivitiesOptions from '@salesforce/apex/ObjectivesHandler.getObjectivitiesOptions';

import {ShowToastEvent} from 'lightning/platformShowToastEvent';

export default class Okr extends LightningElement 
{ 
    @api userOptions = []; //all users in org to dispaly in creation new objective
    @track formData= {} // contain values that will be fetched to Apex methods with key from lwc:ref
    @track objectivityOptions = []; // contain all objectives to whick will be assigned new key result
    @track isAddingObjectivity = false; //show modal for creating new Objective__c
    @track isAddingKeyResult = false; //show modal for creating new KeyResult__c

    //automatically called functions
    // connectedCallback() {
    //     this.loadOptions();
    // }
    @wire(getObjectivitiesOptions)
    wiredData({error, data}){
        if (data) {
            this.objectivityOptions = data;   
        } else if (error) {
            console.log('getObjectivitiesOptionsAccordingUser error: ', JSON.stringify(error))
        }
    }
    //retrieve all objectives in the org
    // async loadOptions(){
    //     try{
    //     let result = await getObjectivitiesOptions();
    //     this.objectivityOptions = result;
    //     }
    //     catch(error){
    //         console.log('Erorr')
    //         console.log(error.message)
    //     }
    // }
    //show modals handler
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
    //submit all fulfilled data to create Objective__c or KeyResult__c
    async handleSubmitToCreate(event){
        for(let prop in this.refs){
             this.formData[prop] = this.refs[prop].value
        }
        try{
            if(event.target.value == 'key'){
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
                    userIdAssigned: this.formData['userId'] 
                })
                this.isAddingObjectivity = false;  
            }
            console.log('Record is created')
        }
        catch(error){
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error creating record',
                    message: error.message,
                    variant: 'error',
                }),
            );
            console.log(JSON.stringify(error));
        }
    }
}