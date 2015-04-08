setwd("~/Sites/bbc/news/special/2014/newsspec_8945/source/data")
library(XLConnect)
library(rjson)

getDataFromSpreadsheet <- function (spreadsheetUrl, worksheet, columnsToDrop = NULL) {
    dataset <- readWorksheet(loadWorkbook(spreadsheetUrl), sheet=worksheet, drop=columnsToDrop)
    # assign column 1 as row names
    rownames(dataset) <- dataset[,1]
    # remove column 1
    dataset <- dataset[,-1]
    return(dataset)
}

updateEnglandData <- function (dataFileUrl, worksheet) {
    mtdataset <- getDataFromSpreadsheet(dataFileUrl, worksheet)
    # assign column names as expected from the js
    colnames(mtdataset) <- c('authorityName', 'regionName', 'nursingLocal', 'residentialLocal', 'homeLocal', 'residentialRegion', 'residentialPrivate')
    write(paste('define(', toJSON(as.data.frame(t(mtdataset))), ');', sep=''), 'dataset.js')
}

updateNationsData <- function (dataFileUrl, worksheet, drop = NULL) {
    nationsDataset <- getDataFromSpreadsheet(dataFileUrl, worksheet, drop)
    colnames(nationsDataset) <- c('nation', 'name', 'shortName', 'hcHourCost_14_15', 'hcHours', 'hcWeeklyCost', 'residential', 'nursing', 'eligibility', 'nursingNotes')
    
    nationsDataset$hcHourCost_14_15 <- ifelse(substr(nationsDataset$hcHourCost_14_15, 1, 1) != '£' & nchar(nationsDataset$hcHourCost_14_15) > 2, paste('£', nationsDataset$hcHourCost_14_15, sep=''), nationsDataset$hcHourCost_14_15)
    nationsDataset$hcWeeklyCost <- ifelse(substr(nationsDataset$hcWeeklyCost, 1, 1) != '£' & nchar(nationsDataset$hcWeeklyCost) > 1, paste('£', nationsDataset$hcWeeklyCost, sep=''), nationsDataset$hcWeeklyCost)
    nationsDataset$residential <- ifelse(substr(nationsDataset$residential, 1, 1) != '£' & nchar(nationsDataset$residential) > 2, paste('£', nationsDataset$residential, sep=''), nationsDataset$residential)
    nationsDataset$nursing <- ifelse(substr(nationsDataset$nursing, 1, 1) != '£' & nchar(nationsDataset$nursing) > 2, paste('£', nationsDataset$nursing, sep=''), nationsDataset$nursing)
    
    write(paste('define(', toJSON(as.data.frame(t(nationsDataset))), ');', sep=''), 'nations_dataset.js')
    View(nationsDataset)
}

# updateEnglandData('england_jan_2.xlsx', 'Unit Costs by CASSR')
updateNationsData('/Volumes/Teams/Journalists/John\ W/care\ calculator/data/foi_data_jan_2.xlsx', 'Sheet1', c(6,8,10,12,14))
# updateNationsData('/Volumes/Teams/Journalists/John\ W/care\ calculator/data/foi_hours_2columns_ref.xlsx', 'Sheet1', c(6,8,9,11,13,15))
