import { LightningElement,api,track } from 'lwc';
import getKeyResults from '@salesforce/apex/KeyResultHandler.getKeyResults';

export default class KeyResultList extends LightningElement 
{
    @api keyResultId;
    @track keyResults;
    @track letRender = false;
    connectedCallback(){
        console.log('refs')
       console.log(this.refs);
       this.loadKeyresults();
    }
    async loadKeyresults(){
        try{
        this.keyResults = await getKeyResults({keyResultId: this.keyResultId});
        console.log('load')
        console.log(JSON.stringify(this.keyResults))
        //this.letRender =true;
        }
        catch(error){
            console.log(error)
        }
        this.dispatchEvent(new CustomEvent('letRender',{detail: this.letRender}));
    }
}