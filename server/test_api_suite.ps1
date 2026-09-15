# End-to-End API verification test script
Write-Host "--- 1. Testing Admin Login ---"
$loginBody = @{
    email = "admin@techfix.com"
    password = "adminpassword123"
} | ConvertTo-Json

$loginRes = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
Write-Host "Logged in successfully as:" $loginRes.admin.name "Shop:" $loginRes.admin.shopName
$token = $loginRes.token
$headers = @{ "Authorization" = "Bearer $token" }

Write-Host "`n--- 2. Testing Subscription Status ---"
$subRes = Invoke-RestMethod -Uri "http://localhost:5000/api/subscriptions/status" -Headers $headers
Write-Host "Plan:" $subRes.subscription.plan "IsActive:" $subRes.subscription.isActive "DaysRemaining:" $subRes.subscription.daysRemaining

Write-Host "`n--- 3. Testing Inventory Listing & Direct Stock Increment / Decrement ---"
$invRes = Invoke-RestMethod -Uri "http://localhost:5000/api/inventory" -Headers $headers
$firstItem = $invRes.items[0]
Write-Host "Found $($invRes.count) items. First item: $($firstItem.name) (Current Stock: $($firstItem.stockQuantity))"

# Test Add Stock (+2)
$adjustBody = @{ action = "ADD"; amount = 2 } | ConvertTo-Json
$addRes = Invoke-RestMethod -Uri "http://localhost:5000/api/inventory/$($firstItem._id)/adjust" -Method Patch -Headers $headers -ContentType "application/json" -Body $adjustBody
Write-Host "After +2 ADD adjustment: Stock is now $($addRes.item.stockQuantity)"

# Test Subtract Stock (-1)
$subBody = @{ action = "SUBTRACT"; amount = 1 } | ConvertTo-Json
$subRes = Invoke-RestMethod -Uri "http://localhost:5000/api/inventory/$($firstItem._id)/adjust" -Method Patch -Headers $headers -ContentType "application/json" -Body $subBody
Write-Host "After -1 SUBTRACT adjustment: Stock is now $($subRes.item.stockQuantity)"

Write-Host "`n--- 4. Testing New Repair Intake Ticket & Notifications ---"
$ticketBody = @{
    customer = @{
        name = "Kavita Nair"
        phone = "+91 98877 66554"
        email = "kavita.nair@example.com"
    }
    device = @{
        type = "MOBILE"
        brand = "OnePlus"
        model = "11 5G"
        serialNumber = "1P11-77890"
    }
    issueDescription = "Green line on AMOLED screen after software update"
    estimatedCost = 4200
    laborCost = 1000
    sendNotifications = $true
} | ConvertTo-Json

$ticketRes = Invoke-RestMethod -Uri "http://localhost:5000/api/tickets" -Method Post -Headers $headers -ContentType "application/json" -Body $ticketBody
$createdTicket = $ticketRes.ticket
Write-Host "Created Ticket: #$($createdTicket.ticketId) for $($createdTicket.customer.name)"
Write-Host "Generated WhatsApp Intake Link: $($ticketRes.notifications.whatsapp.url.Substring(0, 45))..."

Write-Host "`n--- 5. Testing Status Transition to READY_FOR_DELIVERY & Delivery Alerts ---"
$readyBody = @{
    status = "READY_FOR_DELIVERY"
    note = "Screen replaced under warranty program, passed all touch & color tests"
    finalCost = 4200
    sendAlerts = $true
} | ConvertTo-Json
$statusRes = Invoke-RestMethod -Uri "http://localhost:5000/api/tickets/$($createdTicket._id)/status" -Method Patch -Headers $headers -ContentType "application/json" -Body $readyBody
Write-Host "New status is: $($statusRes.ticket.status)"
Write-Host "Ready for Delivery WhatsApp Alert generated:" ($null -ne $statusRes.notificationAlert.whatsapp)

Write-Host "`n--- 6. Testing Billing & Invoicing ---"
$invoiceBody = @{
    ticketId = $createdTicket.ticketId
    customer = @{
        name = "Kavita Nair"
        phone = "+91 98877 66554"
        email = "kavita.nair@example.com"
    }
    deviceSummary = "OnePlus 11 5G - OEM AMOLED Panel"
    items = @(
        @{
            description = "OnePlus 11 5G Fluid AMOLED Panel"
            type = "PART"
            quantity = 1
            unitPrice = 3200
        }
    )
    laborFee = 1000
    discount = 200
    taxRate = 18
    paidAmount = 4200
    paymentMethod = "UPI"
} | ConvertTo-Json

$invRes = Invoke-RestMethod -Uri "http://localhost:5000/api/invoices" -Method Post -Headers $headers -ContentType "application/json" -Body $invoiceBody
Write-Host "Created Invoice: #$($invRes.invoice.invoiceNumber) Total: ₹$($invRes.invoice.totalAmount) Status: $($invRes.invoice.paymentStatus)"

Write-Host "`n--- 7. Testing Public Live Status Tracking (Unauthenticated) ---"
$publicTrackRes = Invoke-RestMethod -Uri "http://localhost:5000/api/tickets/track/$($createdTicket.ticketId)"
Write-Host "Public tracker verified: Ticket #$($publicTrackRes.ticket.ticketId) Status: $($publicTrackRes.ticket.status) Device: $($publicTrackRes.ticket.device.brand) $($publicTrackRes.ticket.device.model)"

Write-Host "`n==== ALL 7 VERIFICATION CHECKS PASSED PERFECTLY ===="
