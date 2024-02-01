trigger KeyResultHandlerTrigger on KeyResult__c (before insert) {
    List <KeyResult__c> keyResults = Trigger.new;
    for(KeyResult__c keyResult : keyResults ){
        if(String.isBlank(keyResult.Name)){
            keyResult.Name.addError('Specify the name of objectivity');
        }
        keyResult.Progress__c = 'In progress';
    }
}