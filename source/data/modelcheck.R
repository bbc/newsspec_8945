setwd("~/Sites/bbc/news/special/2014/newsspec_8945/source/data")

library(XLConnect)
library(reshape2)
library(sqldf)

spreadsheet <- loadWorkbook('bbc_cap_calculator-DH09_01_15.xlsm')
testset <- readWorksheet(spreadsheet, sheet='Testing')

colnames(testset) <- gsub(' ', '_', testset[4,])


longtestset <- as.data.frame(t(testset))

# dataset <- longtestset[,c(-1,-2,-3,-4,-5,-14,-15,-17,-18,-24,-26,-27,-33,-34,-35,-36,-43,-46,-47,-54,-55,-56)]
dataset <- longtestset[,c(-1,-2,-3,-4,-5,-14,-15,-17,-18,-24,-26,-27,-seq(33,56))]

heads <- c('la', 'ownHome', 'sharedHome', 'jointHome', 'valueHome', 'assetsValue', 'assetsShared', 'weeklyIncome', 'weeksToCap', 'userPays', 'councilPays', 'aaPays', 'userTotal', 'totalCost', 'dhweeksToCap', 'dhuserPays', 'dhcouncilPays', 'dhaaPays', 'dhuserTotal', 'dhtotalCost')
length(heads)
ncol(dataset)

colnames(dataset) <- heads
dataset <- dataset[2:nrow(dataset),]

# error scenarios
# 15, 124, 131, 227, 249
# these include city of london, slough, tameside and suffolk
dataset <- dataset[!is.na(dataset$dhuserPays),]



dataset$userPays <- as.numeric(gsub('[£,]', '', dataset$userPays))
dataset$councilPays <- as.numeric(gsub('[£,]', '', dataset$councilPays))
dataset$aaPays <- as.numeric(gsub('[£,]', '', dataset$aaPays))
dataset$userTotal <- as.numeric(gsub('[£,]', '', dataset$userTotal))
dataset$totalCost <- as.numeric(gsub('[£,]', '', dataset$totalCost))

dataset$dhuserPays <- as.numeric(gsub('[£,]', '', dataset$dhuserPays))
dataset$dhcouncilPays <- as.numeric(gsub('[£,]', '', dataset$dhcouncilPays))
dataset$dhaaPays <- as.numeric(gsub('[£,]', '', dataset$dhaaPays))
dataset$dhuserTotal <- as.numeric(gsub('[£,]', '', dataset$dhuserTotal))
dataset$dhtotalCost <- as.numeric(gsub('[£,]', '', dataset$dhtotalCost))

# 1. how many users can afford to pay all their care without any support
bbcq1 <- dataset[ dataset$councilPays == 0,]
nrow(bbcq1) # 75

dhq1 <- dataset[ dataset$dhcouncilPays == 0,]
nrow(dhq1) # 66

# 2. how many users we flag as able to pay are also flagged by dh 
q2 <- dataset[dataset$councilPays == '£0' & dataset$dhcouncilPays == '£0',]
nrow(q2) # 66

# 3. scenarios where we are not the same as dh
q3 <- sqldf('select * from dataset where councilPays = 0 and dhcouncilPays <> 0')
q3
nrow(q3) # 9

sqldf('select count(*) from q3 where userPays = dhuserPays')
sqldf('select count(*) from q3 where aaPays = (dhaaPays + dhcouncilPays)')
sqldf('select aaPays, (dhaaPays + dhcouncilPays) as dhaa_council from q3')

# 4. scenarios where the time to cap is different from the the dh model
q4 <- sqldf('select * from dataset where weeksToCap <> dhweeksToCap')
nrow(q4) # 0

# 5. scenarios where user pays nothing
q5 <- sqldf('select * from dataset where userPays = "£0" or dhuserPays = "£0"')
q5 # 0

# 6. scenarios where total cost of care are different
q6 <- sqldf('select * from dataset where totalCost <> dhtotalCost')
nrow(q6) # 0

# 7. scenarios where user contributions are different from the DH models
q7 <- sqldf('select * from dataset where userPays <> dhuserPays')
nrow(q7) # 173



# 3. We would expect attendance allowance should always be higher for BBC – is this the case?
sqldf('select count(*) from dataset where aaPays < dhaaPays')
# aa is always higher with the bbc model

# 4. We should always have the same user pay, if the user is a self-funder – is this the case?
q4_1 <- sqldf('select * from dataset where councilPays = 0 and userPays = dhuserPays')
# 60

q4_2 <- sqldf('select * from dataset where councilPays = 0 and userPays <> dhuserPays')
# in cases where the user (bbc model) is a self funder i have found 15 instances where the user pays figure are different but in all the cases, the difference is £100

sqldf('select userPays as user, dhuserPays as dhuser, abs(userPays - dhuserPays) as difference from dataset where councilPays = 0 and userPays <> dhuserPays')

# 5. We should always have different results if the person is in the means test – is this the case?
q5a <- sqldf('select userPays, dhUserPays from dataset where councilPays > 0 and userPays <> dhuserPays')
nrow(q5a)

# 179 instances where users are in the means test
nrow(q5a)
q5a
q5b <- sqldf('select * from dataset where councilPays > 0 AND userPays = dhuserPays')
nrow(q5b)
sqldf('select count(*) from q5b where ownHome = "No" OR sharedHome = "Yes" OR valueHome = "£0"')
# we have instances contrary to expectation 5. These users have property disregarded either because it is shared or they do not own one and also one instance where the property is valued under £4k. AND they also have really low values for their capital assets, either because initial values are low or the assets are of shared ownership

# 6. What is the average difference in our results for people in the means test vs DH?
sqldf('select userPays, dhuserPays, (userPays - dhuserPays) as user, aaPays, dhaaPays, (aaPays - dhaaPays) as aa, councilPays, dhcouncilPays, (councilPays - dhcouncilPays) as council from dataset where councilPays > 0')
sqldf('select avg((userPays - dhuserPays)) as avguser, avg((userPays - dhuserPays)) / avg(userPays) as userpays, avg((aaPays - dhaaPays)) as avgaa, avg((aaPays - dhaaPays)) / avg(aaPays) as aapays, min(aaPays), min(dhaaPays), avg((councilPays - dhcouncilPays)) as avgcouncil, avg((councilPays - dhcouncilPays)) / avg(councilPays) as councilpays from dataset where councilPays > 0')
avg user - 550.28, 1%
avg aa - 398.88, 37%
avg council - 949.16, 1.3%
# why is % value for aa so high?
sqldf('select count(*) from dataset where councilPays > 0')
sqldf('select aaPays, dhaaPays from dataset where councilPays > 0 order by (aaPays - dhaaPays) asc')
sqldf('select count(*) as avgaa, avg((aaPays - dhaaPays)) from dataset where councilPays > 0')

sqldf('select avg(userPays) from dataset')

# 7. Can this difference be attributed entirely to attendance allowance?

# 8 how many scenarios where userpays = dhuserPays
sqldf('select count(*) from dataset where userPays = dhuserPays')
sqldf('select count(*) from dataset where userPays = dhuserPays and aaPays = (dhaaPays + dhcouncilPays)')
sqldf('select avg(userPays - dhuserPays) from dataset where userPays <> dhuserPays')

sqldf('select userPays, dhuserPays, userPays - dhuserPays as difference from dataset where userPays <> dhuserPays order by (userPays - dhuserPays) asc')
sqldf('select * from dataset where userPays <> dhuserPays and (userPays - dhuserPays) >= 1000 order by (userPays - dhuserPays) asc')
