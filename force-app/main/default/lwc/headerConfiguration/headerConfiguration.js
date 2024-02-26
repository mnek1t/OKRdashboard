import { LightningElement, api, track,wire} from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import USER_NAME from '@salesforce/schema/User.Name';
import USER_ID from '@salesforce/user/Id';
//apex methods
import createObjective from '@salesforce/apex/ObjectivesHandler.createObjective';
import createKeyResult from '@salesforce/apex/KeyResultHandler.createKeyResult';
import getObjectivesOptions from '@salesforce/apex/ObjectivesHandler.getObjectivesOptions';
import getUsers from '@salesforce/apex/UserHandler.getUsers'; //returns all users in the org
import getKeyRecordsOptions from '@salesforce/apex/KeyResultHandler.getKeyRecordsOptions';
import createReview from '@salesforce/apex/KeyResultHandler.createReview'; // creates a record for Review__c object
import createGoogleReview from '@salesforce/apex/KeyResultHandler.createGoogleReview';
import createSurvey from '@salesforce/apex/KeyResultHandler.createSurvey';
import createCaseStudy from '@salesforce/apex/KeyResultHandler.createCaseStudy';

import {ShowToastEvent} from 'lightning/platformShowToastEvent';

export default class HeaderConfiguration extends LightningElement 
{
    @track userId = USER_ID; // user id of current user or chosen from the combobox
    @track objectivityYear = new Date().getFullYear(); //variable that takes the year
    @track assignedUserObjectivities; //contain user id that is chosen from combobox

    @track userOptions = []; //options for combobox to dispaly assigned objectives to chosen user
    @track yearOptions = []; //options for combobx to display assigned objectives with corresponig year
    @track activityButtons = []; //options for combobx to display buttons that can create objective, keyresult and so on.

    @track action;
    @track keyResultsRecords; //upload all keyResults records to assign them to related fields
    @track formData = []; // array that contain parameters to fetch to apex method to create a related field
    //show templates modal
    isCreateReview = false;
    isCreateGoogleReview = false;
    isCreateSurvey = false;
    isCreateCaseStudy = false;
    isCreateObjective = false;
    isCreateKeyResult = false;

    @track objectivesOptions = []; 

    
    //automatically get user id that is chosen from combobox
    @wire(getRecord,{recordId: '$userId',fields:[USER_NAME]})
    wiredUser(value) {
        //this.wiredActivities = value;
        const { error, data } = value;
        if (data) {
            this.assignedUserObjectivities = data.fields.Name.value;
        } 
        else {
            console.log(JSON.stringify(error))
        }
    }
    //automatically get objectives that is chosen from combobox
    wiredObjectives; //track the provisioned value
    @wire(getObjectivesOptions)
    wiredObjective(value){
        this.wiredObjectives = value;
        const { error, data } = value;
        if (data) {
            this.objectivesOptions = data;   
        } else if (error) {
            console.log('getObjectivitiesOptionsAccordingUser error: ', JSON.stringify(error))
        }
    }
    //automatically get Key Results that is chosen from combobox
    wiredKeyResults; //track the provisioned value
    @wire(getKeyRecordsOptions)
    wiredKeyResult(value){
        this.wiredKeyResults = value;
        const { error, data } = value;
        if (data) {
            this.keyResultsRecords = data;   
        } else if (error) {
            console.log('getKeyRecordsOptions error: ', JSON.stringify(error))
        }
    }
    refreshObjective() {
        refreshApex(this.wiredObjectives);
        this.template.querySelector('c-objectvity-list').refreshData();
    }
    refreshKeyResult() {
        refreshApex(this.wiredKeyResults);
        //this.template.querySelector('c-objectvity-list').refreshKeyResult();
    }
    // auto launch the methods
    connectedCallback() {
        this.loadUserOptions(); 
        this.getNextTenYears();
        this.loadButtons();
    }
    //retrieve ten next years in the org to options for combobox
    getNextTenYears(){
        let currentYear = new Date().getFullYear()-2;
        for(let i = 0; i < 12; i++) {
            this.yearOptions.push({ label: `${currentYear + i}`, value: `${currentYear + i}` });
        }
    }
    //retrieve all active users in the org to options for combobox
    async loadUserOptions(){
        this.userOptions = await getUsers();
    }
    //retrive all activity buttons
    loadButtons(){
        const buttons = ['New objective','New key result','New review', 'New survey', 'New case study', 'New google review']
        for(let i = 0; i < buttons.length ;i++)
        {
            this.activityButtons.push({label:`${buttons[i]}`,value:`${buttons[i]}`})
        }
    }
    //Handlers for buttons
    handleOpeningCreatingReview(){
        this.isCreateReview = false;
    }
    handleOpeningCreatingGoogleReview(){
        this.isCreateGoogleReview = false;
    }
    handleOpeningCreatingSurvey(){
        this.isCreateSurvey = false;
    }
    handleOpeningCreatingCaseStudy(){
        this.isCreateCaseStudy = false;
    }
    handleOpeningCreatingObjecive(){
        this.isCreateObjective = false;
    }
    handleOpeningCreatingKeyResult(){
        this.isCreateKeyResult = false;
    }
    // handle a choice from checkbox of buttons to provide some activity
    provideActivity(event){
        if(event.detail.value == 'New review'){
            this.isCreateReview = true;
        }
        if(event.detail.value == 'New google review'){
            this.isCreateGoogleReview = true;
        }
        if(event.detail.value == 'New survey'){
            this.isCreateSurvey = true;
        }
        if(event.detail.value == 'New case study'){
            this.isCreateCaseStudy = true; 
        }
        if(event.detail.value == 'New objective'){
            this.isCreateObjective = true; 
        }
        if(event.detail.value == 'New key result'){
            this.isCreateKeyResult = true; 
        }
        this.action = event.detail.value;      
    }
    //handle the changes in user combobox
    switchUserObjectivities(event){
        this.userId = event.detail.value;
    }
    //handle changes in year combobox
    switchYearObjectivities(event){
        this.objectivityYear = event.detail.value;
    }
    async handleSubmitObjective(){
        this.formData = [];
        for(let prop in this.refs){
            this.formData[prop] = this.refs[prop].value
        }
        try{
            await createObjective({
                objName: this.formData['objectiveName'], 
                description: this.formData['description'], 
                startDate: this.formData['startDate'], 
                endDate: this.formData['endDate'],  
                userIdAssigned: this.formData['userId'] 
            })
            this.isCreateObjective = false;  
            console.log('Record is created')
            this.refreshObjective();
        }
        catch(error)
        {
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
    //handler for a creating a new record in Salesforce
    async handleSubmitKeyResult(){
        this.formData = [];
        for(let prop in this.refs){
            this.formData[prop] = this.refs[prop].value;
        }
        try{
            await createKeyResult({
                keyResultName: this.formData['keyResultName'],
                objectivityId: this.formData['objectivityId']
            })
            this.isCreateKeyResult = false;  
            console.log('Record is created');
            this.refreshKeyResult();
        }
        catch(error)
        {
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
    //handlers to submit data to apex method to reate related objects record for Key_Result__c
    async handleSubmitReview(){
        this.formData = [];
        for(let prop in this.refs){
            this.formData[prop] = this.refs[prop].value;
            
        }
        try {
            await createReview({
                reviewName: this.formData['reviewName'],
                keyResultId: this.formData['keyResult']
            })
            console.log('Review is created!')
        } catch (error) {
            console.log('Error in creating a Review',JSON.stringify(error))
        }
        this.isCreateReview = false;
     }
     async handleSubmitGoogleReview(){
        this.formData = [];
        for(let prop in this.refs){
            this.formData[prop] = this.refs[prop].value
        }
        try {
            await createGoogleReview({
                googleReviewName: this.formData['googleReviewName'],
                keyResultId: this.formData['keyResult']
            })
            console.log('Google Review is created!')
        } catch (error) {
            console.log('Error in creating a Google Review',JSON.stringify(error))
        }
        this.isCreateGoogleReview = false;
     }
     async handleSubmitSurvey(){
        this.formData = [];
        for(let prop in this.refs){
            this.formData[prop] = this.refs[prop].value
        }
        try {
            await createSurvey({
                surveyName: this.formData['surveyName'],
                keyResultId: this.formData['keyResult']
            })
            console.log('Survey is created!')
        } catch (error) {
            console.log('Error in creating a Survey',JSON.stringify(error))
        }
        this.isCreateSurvey = false;
     }
     async handleSubmitCaseStudy(){
        this.formData = [];
        for(let prop in this.refs){
            this.formData[prop] = this.refs[prop].value
        }
        try {
            await createCaseStudy({
                caseStudyName: this.formData['caseStudyName'],
                keyResultId: this.formData['keyResult']
            })
            console.log('Case Study is created!')
        } catch (error) {
            console.log('Error in creating a Survey',JSON.stringify(error))
        }
        this.isCreateCaseStudy = false;
     }

    @track trackedFields = []
    getTrackFields(event){
        this.trackedFields = event.detail;
    }
    
}