param(
    [int]$Limit = 20
)

gh repo list --limit $Limit --json nameWithOwner,visibility,updatedAt
