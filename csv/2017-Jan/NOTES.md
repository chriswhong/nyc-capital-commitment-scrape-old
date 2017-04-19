# PostgreSQL queries to run on the raw commitments data

## Sum costs, group by managing agency and project id

SELECT managingagency, projectid, description, SUM(citycost) as citycost, SUM(noncitycost) as noncitycost, SUM(citycost + noncitycost) as totalcost FROM commitments GROUP BY managingagency, projectid, description ORDER BY totalcost DESC
