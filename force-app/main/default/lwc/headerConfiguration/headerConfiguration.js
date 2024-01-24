import { LightningElement, api, track,wire} from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import USER_NAME from '@salesforce/schema/User.Name';
import USER_ID from '@salesforce/user/Id';
//apex methods
import getUsers from '@salesforce/apex/UserHandler.getUsers'; //returns all users in the org
import getObjectivitiesOptionsAccordingUser from '@salesforce/apex/ObjectivesHandler.getObjectivitiesOptionsAccordingUser';
import getKeyRecords from '@salesforce/apex/KeyResultHandler.getKeyRecords';
import createReview from '@salesforce/apex/KeyResultHandler.createReview'; // creates a record for Review__c object

export default class HeaderConfiguration extends LightningElement 
{
    @track userId = USER_ID; // user id of current user or chosen from the combobox
    @track objectivityYear = new Date().getFullYear(); //variable that takes the year
    @track assignedUserObjectivities; //contain user id that is chosen from combobox

    @track userOptions= []; //options for combobox to dispaly assigned objectives to chosen user
    @track yearOptions= []; //options for combobx to display assigned objectives with corresponig year
    @track activityButtons = []; //options for combobx to display buttons that can create objective, keyresult and so on.

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
        //this.loadKeyRecords();
    }
    // async loadKeyRecords(){
    //     try{
    //         this.keyResultsRecords = await getKeyRecords();
    //         //let keyResults = await getKeyRecords();
    //         // console.log(keyResults)
    //         // for(let i = 0; i < keyResults.length ;i++)
    //         //     {
    //         //         this.keyResultsRecords.push({label:`${keyResults[i]}`,value:`${keyResults[i]}`})
    //         //     }
    //         console.log('leyresultRecords', JSON.stringify(this.keyResultsRecords))
    //     }
    //     catch(error){
    //         console.log('Error in loading keyResults', error)
    //     }
    // }

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
        let buttons = ['Add objectivity', 'Add key result', 'New review', 'New survey', 'New case study', 'New google review']
        for(let i = 0; i < buttons.length ;i++)
        {
            this.activityButtons.push({label:`${buttons[i]}`,value:`${buttons[i]}`})
        }
    }
    //@track isCreateReview = false;
    //@track formData = [];

    //Handlers for buttons
    handleOpeningCreatingReview(){
        this.isCreateReview = false;
    }
    // async handleSubmitReview(){
    //     for(let prop in this.refs){
    //         this.formData[prop] = this.refs[prop].value
    //     }
    //     console.log('formdata',JSON.stringify(this.formData['keyResult']))
    //     console.log('formdata ID',this.formData['keyResult'])
    //     console.log('formdata NAME',this.formData['reviewName'])

    //     try {
    //         aaa = await createReview({
    //             reviewName: this.formData['reviewName'],
    //             keyResultId: this.formData['keyResult']
    //         })
    //     } catch (error) {
    //         console.log('Error in creating a Review',JSON.stringify(error))
    //         //console.log(this.a)
    //     }
    // }
    // handle a choice from checkbox of buttons to provide some activity
    provideActivity(event){
        if(event.detail.value == 'New review'){
            this.isCreateReview = true;
        }
        this.action = event.detail.value;
        console.log('action', JSON.stringify(this.action ))
    }
    //handle the changes in user combobox
    switchUserObjectivities(event){
        this.userId=event.detail.value;
    }
    //handle changes in year combobox
    switchYearObjectivities(event){
        this.objectivityYear = event.detail.value;
    }
    // @track objList = [];
    // async getObj(){
    //     this.objList = await getObjectivitiesOptionsAccordingUser()
    // }
    @track trackedFields = []
    getTrackFields(event){
        this.trackedFields = event.detail;
    }
}