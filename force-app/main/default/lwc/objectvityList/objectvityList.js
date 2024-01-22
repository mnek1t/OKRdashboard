import { LightningElement,wire,track,api } from 'lwc';
import getObjectivities from '@salesforce/apex/ObjectivesHandler.getObjectivities';
import getKeyResults from '@salesforce/apex/KeyResultHandler.getKeyResults';

export default class ObjectvityList extends LightningElement 
{
    @api trackFields;
    @api user;
    @track letrender = true;
    @track objectivities;
   
    @track opportunities;
    connectedCallback(){
        this.loadObjectivities();
    }
    async loadObjectivities(){
        this.objectivities = await getObjectivities();
        //this.opportunities = await getKeyResults({id: this.template.querySelector('#keyResId')});
        // console.log('objectivitylist')
        // console.log(this.trackFields)
    }
    letRender(event){
        this.letrender = event.detail;
    }
}