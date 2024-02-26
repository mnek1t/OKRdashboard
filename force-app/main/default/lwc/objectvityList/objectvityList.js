import { LightningElement,wire,track,api } from 'lwc';
import { refreshApex } from '@salesforce/apex';
//apex methods
import getObjectivesAccordingUser from '@salesforce/apex/ObjectivesHandler.getObjectivesAccordingUser';
export default class ObjectvityList extends LightningElement 
{
    @api userId; // get userId from headerConfiguration component to display objectives only assigned to this user
    @api year; // get year from headerConfiguration component to display objectives only assigned to this year and further, (not past)
    @api trackedFields; // TODO write a commeent
    @track objectivities; // contain a list of objectives

    wiredObjectives; //track the provisioned value
    //automatically retirieve objective in accordance to particaular userId and specified year
    @wire(getObjectivesAccordingUser, {user: '$userId', year: '$year'})
    wiredData(value){
        this.wiredObjectives = value;
        const {error, data} = value;
        if (data) {
            this.objectivities = data;   
        } else if (error) {
            console.log('getObjectivesAccordingUser error: ', JSON.stringify(error))
        }
    }
    @api 
    refreshData()
    {
        refreshApex(this.wiredObjectives);
    }
}