setwd("~/Sites/bbc/news/special/2014/newsspec_8945/source/data")
library(XLConnect)
library(rjson)

workbook <- loadWorkbook('bbc_cap_calculator-DH16_01_15.xlsm')
testData <- readWorksheet(workbook, sheet='Testing')

colnames(testData) <- gsub(' ', '_', testData[4,])

testData <- as.data.frame(t(testData))

testData <- testData[,c(-seq(1,5),-14,-15,-17,-18,-24,-25,-29,-31,-35)]

colnames(testData) <- c('location', 'home', 'homeShared', 'homeJointlyOwned', 'homeValue', 'capital', 'capitalJointlyOwned', 'income', 'weeksToCap', 'userPays', 'councilPays', 'aaPays', 'totalPaidByUser', 'totalCost', 'totalAssets', 'assetsDepletionRate', 'numberOfWeeksAboveMT', 'assetValueAtCOP', 'weeksToCOP', 'aaSpendToCOP', 'totalAASpend', 'finalAssetValue', 'weeksRemaining', 'averageTI', 'averageSupport', 'weeklyCost', 'weeksToCapPastThePost')

head(testData[,1:5])

testData <- testData[-1,]

# View(testData)

testData$homeValue <- as.numeric(gsub('[,£ ]', '', testData$homeValue))
testData$capital <- as.numeric(gsub('[,£ ]', '', testData$capital))
testData$income <- as.numeric(gsub('[,£ ]', '', testData$income))
testData$weeksToCap <- as.numeric(gsub('[,£ ]', '', testData$weeksToCap))
testData$userPays <- as.numeric(gsub('[,£ ]', '', testData$userPays))
testData$councilPays <- as.numeric(gsub('[,£ ]', '', testData$councilPays))
testData$aaPays <- as.numeric(gsub('[,£ ]', '', testData$aaPays))
testData$totalPaidByUser <- as.numeric(gsub('[,£ ]', '', testData$totalPaidByUser))
testData$totalCost <- as.numeric(gsub('[,£ ]', '', testData$totalCost))
testData$totalAssets <- as.numeric(gsub('[,£ ]', '', testData$totalAssets))
testData$assetsDepletionRate <- as.numeric(gsub('[,£ ]', '', testData$assetsDepletionRate))
testData$numberOfWeeksAboveMT <- as.numeric(gsub('[,£ ]', '', testData$numberOfWeeksAboveMT))
testData$assetValueAtCOP <- as.numeric(gsub('[,£ ]', '', testData$assetValueAtCOP))
testData$weeksToCOP <- as.numeric(gsub('[,£ ]', '', testData$weeksToCOP))
testData$aaSpendToCOP <- as.numeric(gsub('[,£ ]', '', testData$aaSpendToCOP))
testData$finalAssetValue <- as.numeric(gsub('[,£ ]', '', testData$finalAssetValue))
testData$weeksRemaining <- as.numeric(gsub('[,£ ]', '', testData$weeksRemaining))
testData$averageTI <- as.numeric(gsub('[,£ ]', '', testData$averageTI))
testData$averageSupport <- as.numeric(gsub('[,£ ]', '', testData$averageSupport))
testData$weeklyCost <- as.numeric(gsub('[,£ ]', '', testData$weeklyCost))

testData$home <- ifelse(testData$home == 'Yes', 1, 2)
testData$capitalJointlyOwned <- ifelse(testData$capitalJointlyOwned == 'Yes', 1, 2)
testData$homeJointlyOwned <- ifelse(testData$homeJointlyOwned == 'Yes', 1, 2)
testData$homeShared <- ifelse(testData$homeShared == 'Yes', 1, 2)

nrow(testData)
testData <- testData[ testData$weeksToCap >=0 & !is.na(testData$home), ]       
testData <- testData[ testData$weeksToCap >=0 & !is.na(testData$home), ]


nrow(testData)
# head(testData)
# View(testData)
write(paste('define(', toJSON(as.data.frame(t(testData))), ');', sep=''), '../js/spec/features/fixtureData.js')

# nrow(complete.cases(testData))
# testData['Scenario_252',]

# nrow(testData[is.na(testData$home),])

# assetsDepletionRate
# testData['Scenario_104',]
# 
# testData['Scenario_215',]

# testData['Scenario_150',]
# numberOfWeeksAboveUpperCapitalLimit - 22.091310751104572 (js), 23 (excel)
# numberOfWeeksToReachCrossOverPoint - 0 (js), 0 (excel)
# result of 85 * (numberOfWeeksAboveUpperCapitalLimit + numberOfWeeksToReachCrossOverPoint) = 4% of expected value
# 
# testData['Scenario_207',]
# numberOfWeeksAboveUpperCapitalLimit - 14.124293785310735 (js), 15 (excel)
# numberOfWeeksToReachCrossOverPoint - 0 (js), 0 (excel)
# result of 85 * (numberOfWeeksAboveUpperCapitalLimit + numberOfWeeksToReachCrossOverPoint) = 6% of expected value

# councilPays figure is out by 9.6% for 1 scenario. for the rest it is within 2%
# testData['Scenario_173',]
# 
# numberOfWeeksInMeansTestedSupport * averageMTSupport 
# 
# numberOfWeeksInMeansTestedSupport, 7.075733145057882 (js), 6.454418 (excel)
# averageMTSupport, 85.60000000000002 (js), 85.6 (excel)


# testData['Scenario_173',]
