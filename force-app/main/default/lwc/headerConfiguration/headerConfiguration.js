import { LightningElement, api, track,wire} from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import USER_NAME from '@salesforce/schema/User.Name';
import USER_ID from '@salesforce/user/Id';
import getUsers from '@salesforce/apex/UserHandler.getUsers';
import getObjectivitiesOptionsAccordingUser from '@salesforce/apex/ObjectivesHandler.getObjectivitiesOptionsAccordingUser';

export default class HeaderConfiguration extends LightningElement 
{
    @track userId = USER_ID;
    @track objectivityYear = new Date().getFullYear();
    @track assignedUserObjectivities;
    //@track user;

    @track userOptions= [];
    @track yearOptions= [];
    @track activityButtons = [];

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
        let buttons = ['Add objectivity', 'Add key result', 'New review', 'New survey', 'New case study', 'New google review']
        for(let i = 0; i < buttons.length ;i++)
        {
            this.activityButtons.push({label:`${buttons[i]}`,value:`${buttons[i]}`})
        }
    }
    //Handlers
    provideActivity(event){
        this.action = event.detail.value;
    }
    switchUserObjectivities(event){
        this.userId=event.detail.value;
        console.log('UserId from headerConfiguration', this.userId)
        //this.getObj();
    }
    switchYearObjectivities(event){
        this.objectivityYear = event.detail.value;
    }
    @track objList = [];
    async getObj(){
        this.objList = await getObjectivitiesOptionsAccordingUser()
    }
    // getTrackFields(event){
    //     console.log('headerConfiguration')
    //     console.log(event.detail)
    //     this.trackFields = event.detail;
    //     console.log(this.trackFields)
    // }
}