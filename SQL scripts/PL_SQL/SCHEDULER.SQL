BEGIN
    DBMS_SCHEDULER.create_job (
        job_name        => 'JOB_RELEASE_TICKETS',
        job_type        => 'PLSQL_BLOCK',
        job_action      => 'BEGIN Release_Tickets; END;',
        start_date      => SYSTIMESTAMP,
        repeat_interval => 'FREQ=MINUTELY; INTERVAL=1',
        enabled         => TRUE,
        comments        => 'Releases expired tickets held in progress'
    );
END;
/

