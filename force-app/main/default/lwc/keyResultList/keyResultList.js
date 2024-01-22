import { LightningElement,api,track } from 'lwc';
import getKeyResults from '@salesforce/apex/KeyResultHandler.getKeyResults';

export default class KeyResultList extends LightningElement 
{
    @api keyResultId;
    @track keyResults;
    @track letRender = false;
    @track amoutOfOpportunities;
    connectedCallback(){
       this.loadKeyresults();
    }
    async loadKeyresults(){
        try{
        this.keyResults = await getKeyResults({keyResultId: this.keyResultId});
        //this.amoutOfOpportunities = this.keyresult.Opportunities__r;
        //onsole.log('Opps size:' + this.keyresult.Opportunities__r)
        // console.log('load')
        // console.log(JSON.stringify(this.keyResults))
        //this.letRender =true;
        }
        catch(error){
            console.log(error)
        }
        this.dispatchEvent(new CustomEvent('letRender',{detail: this.letRender}));
    }
}