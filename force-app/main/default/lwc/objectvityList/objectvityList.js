import { LightningElement,api,track  } from 'lwc';
import getObjectivities from '@salesforce/apex/ObjectivesHandler.getObjectivities';

export default class ObjectvityList extends LightningElement 
{
    @track objectivities;
    connectedCallback(){
        this.loadObjectivities();
    }
    loadObjectivities(){
        getObjectivities()
        .then(result=>{
            this.objectivities = result;
        })
        .catch(error=>{})
    }
}