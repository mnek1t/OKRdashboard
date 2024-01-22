public with sharing class ObjectivesHandler 
{
    @AuraEnabled
    public static Objective__c createObjective(String objName,String description,Date startDate, Date endDate, Id userIdAssigned)
    {
        Objective__c newObjectivity = new Objective__c(
            Name = objName, 
            Description__c = description,
            Owner__c = userIdAssigned,
            Start_date__c = startDate,
            End_Date__c = endDate 
        );
        insert newObjectivity;
        return newObjectivity;
    }
    @AuraEnabled(cacheable=true)
    public static List<Map<String,String>> getObjectivitiesOptions(){
        List<Map<String,String>> objectivityOptions = new List<Map<String,String>>();
        for(Objective__c objectivity :[SELECT Id, Name FROM Objective__c]){
            Map<String,String> option = new Map<String,String>{
                'label'=> objectivity.Name,
                'value' => (String)objectivity.Id
            };
            objectivityOptions.add(option);
            System.debug(option);
        }
        return objectivityOptions;
    }
    @AuraEnabled(cacheable=true)
    public static List<Objective__c> getObjectivitiesOptionsAccordingUser(String user, String year){
        List<Objective__c> objectives  = 
            [SELECT Id, Name,(SELECT Id,Name,Progress__c FROM Key_Results__r) FROM Objective__c 
            WHERE Owner__c =: (Id)user AND CALENDAR_YEAR(Start_date__c) <=: Integer.valueOf(year)];
        return objectives;
    }
    @AuraEnabled(cacheable=true)
    public static List<Objective__c> getObjectivities(){
        return [SELECT Id, Name ,(SELECT Id,Name,Progress__c FROM Key_Results__r) FROM Objective__c];
    }
     
}