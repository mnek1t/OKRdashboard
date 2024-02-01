import { LightningElement,wire,track,api } from 'lwc';
//apex methods
import getObjectivitiesOptionsAccordingUser from '@salesforce/apex/ObjectivesHandler.getObjectivitiesOptionsAccordingUser';
export default class ObjectvityList extends LightningElement 
{
    @api userId; // get userId from headerConfiguration component to display objectives only assigned to this user
    @api year; // get year from headerConfiguration component to display objectives only assigned to this year and further, (not past)
    @api trackedFields; // TODO write a commeent
    @track objectivities; // contain a list of objectives
    
    //automatically retirieve objective in accordance to particaular userId and specified year
    @wire(getObjectivitiesOptionsAccordingUser, {user: '$userId', year: '$year'})
    wiredData({error, data}){
        if (data) {
            this.objectivities = data;   
        } else if (error) {
            console.log('getObjectivitiesOptionsAccordingUser error: ', JSON.stringify(error))
        }
    }
}