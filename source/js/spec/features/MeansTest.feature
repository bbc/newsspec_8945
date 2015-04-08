Feature: Property inclusion in Means Test calculation
    Property (house) is included in Means Test unless it is shared with a close relative

    Scenario: User owns a property
        Given a user owns a property
        Then include the property in the Mean Test calculation

    Scenario: No property
        Given a user does not own a property
        Then exclude property from Means Test calculation

    Scenario: A close relative lives in the property
        Given a user owns a property
        And a close relative lives the property
        Then exclude the property in Means Test calculation

    Scenario: Property is jointly owned
        Given a user owns a property
        And the property is jointly owned
        Then include the property in the Means Test calculation

Feature: Property value calculation
    Property value set to £0 when property is excluded in Means Test calculation
    Property value is set to the original property value when property is included
    Property value is set to half the original property value when property is included and jointly owned

    Scenario: Set value of property to £0 when property is excluded
        Given a property is excluded
        Then the value of the property should be £0

    Scenario: Set value of property where property is included
        Given a property is included
        And it is not jointly owned
        Then the value of the property is set to full value of property

    Scenario: Set value of property where property is jointly owned
        Given a property is included
        And the property is jointly owned
        Then the value of the property is half its full value

Feature: Upper capital limit (UCL)
    The value of the upper capital limit is £118, 000 unless property is excluded and the property is shared at which the upper capital limit reduces to £27, 000

    Scenario: Property excluded
        Given a user owns a property
        And the property is excluded from the Means Test
        Then the value of their UCL should be set at £27,000

    Scenario: Property included
        Given a user owns a property
        And the property is included in the Means Test
        Then the value of their UCL should be set at £118,000

    Scenario: No property
        Given a user does not own a property
        Then the value of their UCL should be set at £118,000


Feature: Treatment of asset value
    Assets valued at half their true value if jointly owned

    Scenario:
        Given a user has assets
        And they are the sole owner of the assets
        Then the value of the assets is set to their original value

    Scenario: 
        Given a user has assets
        And they are jointly owned
        Then the value of the assets is set to half their original value


Feature: Total assets
    The sum of values for a user's property and any capital assets they may own

    Scenario: 
        Given a user owns a property
        And they own some capital assets
        Then the total assets is the sum of the values of their total assets

Feature: accessibleTotalAssets
    The sum total of the user's total assets less the lower capital limit

    Scenario: User with assets valued above lower capital limit
        Given a user owns some assets
        And they are valued above the lower capital limit
        Then the value of the accessible total assets is the difference in value of assets minus the lower capital limit

    Scenario: User with assets valued below lower capital limit
        Given a user owns some assets
        And the assets are valued below the lower capital limit
        Then the value of the accessible total assets is 0

Feature: Time to reach the care cap
    This is the time it takes a user to reach £72,000 of paid care costs

    Scenario: time to reach care cap
        Given a user is in care
        Then they have a finite amount of time they should be paying money towards their care

Feature: Tarrif income
    When a user's assets deplet to or below the upper capital limit and above the lower capital limit they are liable to pay £1 for every £250 they own

    Scenario: User assets above upper capital limit
        Given a user owns assets
        And they are valued above the upper capital limit
        Then the tarrif income is 0

    Scenario: User assets between upper capital and lower capital limits
        Given a user owns assets
        And they are valued between the upper capital limit and the lower capital limit
        Then the user is liable to pay £1 for every £250 they own

    Scenario: User assets below lower capital limit
        Given a user owns assets
        And they are valued below the lower capital limit
        Then the tarrif income is 0

Feature: User's accessible income
    A user's weekly income should be calculated correctly

    Scenario: User gets no means tested support
        Given a user is getting no means tested support
        Then their total accessible income includes attendance allowance and excludes personal expenses allowance

    Scenario: User gets means tested support valued at less than value of attendance allowance
        Given a user is getting means tested support
        And the value of the support is less than the value of attendance allowance
        Then the total accessible income includes attendance allowance and excludes personal expenses allowance

    Scenario: User gets means tested support valued greater than value of attendance allowance
        Given a user is getting means tested support
        And the value of the support is greater than the value of attendance allowance
        Then the total accessible income excludes attendance allowance and excludes personal expenses allowance

Feature: Means test support
    When the sum of a user's tarrif income and their weekly accessible income is greater than the weekly cost of care user pays for all their care
    When the sum of a user's tarrif income and their weekly accessible income is lower than the weekly cost of care user gets some means tested support

    Scenario: sum of total accessible income and tarrif income greater than weekly care costs
        Given a user has an income
        And has tarrif income
        And the sum of both is greater than the weekly care costs
        Then the user pays for all their care
        And their council does not pay anything

    Scenario: sum of total accessible income and tarrif income less than weekly care costs
        Given a user has an income
        And has tarrif income
        And the sum of both is less than the weekly care costs
        Then the user pays some of their care
        And their council pays for the rest