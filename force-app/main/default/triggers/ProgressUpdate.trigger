trigger ProgressUpdate on Target__c (after update) {
    List<KeyResult__c> keyResults = new List<KeyResult__c>();
    for(Target__c target: Trigger.new)
    {
        Target__c oldTarget = Trigger.oldMap.get(target.Id);
        if(target.Completed__c != oldTarget.Completed__c)
        {
            List<KeyResult__c> keyResultList = [SELECT Id FROM KeyResult__c WHERE Id =: target.Key_Result__c];
            if(!keyResultList.isEmpty())
            {
                KeyResult__c keyResult = keyResultList[0]; 
                List<AggregateResult> resultToAchieve = [SELECT SUM(ToAchieve__c) overall FROM Target__c WHERE Key_Result__c =: keyResult.Id];
                List<AggregateResult> resultCompleted = [SELECT SUM(Completed__c) overall FROM Target__c WHERE Key_Result__c =: keyResult.Id];
                if(!resultToAchieve.isEmpty() && !resultCompleted.isEmpty())
                {
                    Integer amountTargetsToAchieve = (Integer.valueOf(resultToAchieve[0].get('overall')));
                    Integer amountCompletedTargets = (Integer.valueOf(resultCompleted[0].get('overall')));


                    if(amountCompletedTargets < amountTargetsToAchieve/2 || amountTargetsToAchieve==0 )
                        keyResult.Progress__c = 'In progress';
                    else if(amountCompletedTargets >= amountTargetsToAchieve/2 && amountCompletedTargets < amountTargetsToAchieve)
                        keyResult.Progress__c = 'Halfway through';
                    else keyResult.Progress__c = 'Finished';
                    keyResults.add(keyResult);
                }
            }
        }
    }
    update keyResults;
}