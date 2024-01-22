import { LightningElement,wire,track,api } from 'lwc';
import getObjectivitiesOptionsAccordingUser from '@salesforce/apex/ObjectivesHandler.getObjectivitiesOptionsAccordingUser';
import getKeyResults from '@salesforce/apex/KeyResultHandler.getKeyResults';
import getObjectivities from '@salesforce/apex/ObjectivesHandler.getObjectivities';
export default class ObjectvityList extends LightningElement 
{
    @api userId;
    @api year;
    @track objectivities;

    @wire(getObjectivitiesOptionsAccordingUser, {user: '$userId', year: '$year'})
    wiredData({error, data}){
        if (data) {
            this.objectivities = data;
            this.error = undefined;
            //console.log(JSON.stringify(data))
            //console.log(JSON.stringify(this.objectivities))
            
        } else if (error) {
            
            this.error = error;
            this.objectivities = undefined;
            //console.log('error', error)
        }
    }
}