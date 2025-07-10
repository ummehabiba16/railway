--This will run the job every day at 12:05 AM.
BEGIN
  DBMS_SCHEDULER.create_job (
    job_name        => 'JOB_UPDATE_AVAILABLE_DATES',
    job_type        => 'PLSQL_BLOCK',
    job_action      => 'BEGIN UPDATE_AVAILABLE_DATES; END;',
    start_date      => SYSTIMESTAMP,
    repeat_interval => 'FREQ=DAILY;BYHOUR=0;BYMINUTE=5',
    enabled         => TRUE
  );
END;
/
