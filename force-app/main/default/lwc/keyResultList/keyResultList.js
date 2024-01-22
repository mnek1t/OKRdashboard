import { LightningElement,api,track } from 'lwc';
import getKeyResults from '@salesforce/apex/KeyResultHandler.getKeyResults';

export default class KeyResultList extends LightningElement 
{
    @api objectivityId
    @track keyResults = [];
    error;
    // refresh(){
    //     this.loadRelatedKeyResults();
    // }
    connectedCallback(){
        this.loadRelatedKeyResults();
        // this.dispatchEvent(new CustomEvent('customevent',{detail: this.keyResults}));
        // customElements.define('key-result-list', KeyResultList);
    }
    loadRelatedKeyResults()
    {
        getKeyResults({objectivityId: this.objectivityId })
        .then(result=>{
            this.keyResults = result 
        })
        .catch(error=>{})
    }
    
}