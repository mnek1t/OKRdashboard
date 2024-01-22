trigger ObjectivityHandlerTrigger on Objective__c (before insert) 
{
    List <Objective__c> objectivities = Trigger.new;
    for(Objective__c objectivity : objectivities ){
        Date startDate = objectivity.Start_Date__c;
        Date endDate = objectivity.End_Date__c;
        Integer daysBetween = startDate.daysBetween(endDate);
        if(daysBetween<0){
            objectivity.addError('Choose correct dates');
        }
        if(String.isBlank(objectivity.Name)){
            objectivity.Name.addError('Specify the name of objectivity');
        }
    }
}