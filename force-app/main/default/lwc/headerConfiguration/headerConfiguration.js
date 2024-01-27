import { LightningElement, api, track,wire} from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import USER_NAME from '@salesforce/schema/User.Name';
import USER_ID from '@salesforce/user/Id';
//apex methods
import getUsers from '@salesforce/apex/UserHandler.getUsers'; //returns all users in the org
import getKeyRecordsOptions from '@salesforce/apex/KeyResultHandler.getKeyRecordsOptions';
import createReview from '@salesforce/apex/KeyResultHandler.createReview'; // creates a record for Review__c object
import createGoogleReview from '@salesforce/apex/KeyResultHandler.createGoogleReview';
import createSurvey from '@salesforce/apex/KeyResultHandler.createSurvey';
import createCaseStudy from '@salesforce/apex/KeyResultHandler.createCaseStudy';

export default class HeaderConfiguration extends LightningElement 
{
    @track userId = USER_ID; // user id of current user or chosen from the combobox
    @track objectivityYear = new Date().getFullYear(); //variable that takes the year
    @track assignedUserObjectivities; //contain user id that is chosen from combobox

    @track userOptions= []; //options for combobox to dispaly assigned objectives to chosen user
    @track yearOptions= []; //options for combobx to display assigned objectives with corresponig year
    @track activityButtons = []; //options for combobx to display buttons that can create objective, keyresult and so on.

    @track action;
    @track keyResultsRecords; //upload all keyResults records to assign them to related fields
    @track formData = []; // array that contain parameters to fetch to apex method to create a related field
    //show templates modal
    @track isCreateReview = false;
    @track isCreateGoogleReview = false;
    @track isCreateSurvey = false;
    @track isCreateCaseStudy = false;
    //automatically get user id that is chosen from combobox
    @wire(getRecord,{recordId: '$userId',fields:[USER_NAME]})
    wiredUser({ error, data }) {
        if (data) {
            this.assignedUserObjectivities = data.fields.Name.value;
        } else {}
    }
    // auto launch the methods
    connectedCallback() {
        this.loadUserOptions(); 
        this.getNextTenYears();
        this.loadButtons();
        this.loadKeyRecords();
    }
    //load keyResult records
    async loadKeyRecords(){
        try{
            let result = await getKeyRecordsOptions();
            this.keyResultsRecords = result;
        }
        catch(error){
            console.log('Error in loading keyResults', error)
        }
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
        let buttons = ['New review', 'New survey', 'New case study', 'New google review']
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
    //handlers ro submit data to apex method to reate related objects record for Key_Result__c
    async handleSubmitReview(){
        this.formData = [];
        for(let prop in this.refs){
            this.formData[prop] = this.refs[prop].value
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
        this.isCreateSurvey = false;
     }

    @track trackedFields = []
    getTrackFields(event){
        this.trackedFields = event.detail;
    }
}