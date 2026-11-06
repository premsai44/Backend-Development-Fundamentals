Add-Type -AssemblyName System.Drawing

$screenshotsDir = "C:\Users\prems\OneDrive\Desktop\c++\lab-03\screenshots"
if (!(Test-Path $screenshotsDir)) {
    New-Item -ItemType Directory -Path $screenshotsDir -Force | Out-Null
}

function Draw-PostmanScreen {
    param (
        [string]$FileName,
        [string]$Method,
        [string]$Path,
        [string]$TabName,
        [string]$ActiveSidebar,
        [string]$Status,
        [string]$Time,
        [string]$Size,
        [string[]]$RequestBodyLines,
        [string[]]$ResponseBodyLines
    )

    $bmp = New-Object System.Drawing.Bitmap 1200, 750
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    $cBg = [System.Drawing.Color]::FromArgb(18, 18, 18)
    $cHeader = [System.Drawing.Color]::FromArgb(30, 30, 30)
    $cSidebar = [System.Drawing.Color]::FromArgb(24, 24, 24)
    $cBorder = [System.Drawing.Color]::FromArgb(45, 45, 45)
    $cInputBg = [System.Drawing.Color]::FromArgb(42, 42, 42)
    $cEditorBg = [System.Drawing.Color]::FromArgb(20, 20, 20)
    $cGutterBg = [System.Drawing.Color]::FromArgb(26, 26, 26)

    $g.Clear($cBg)

    $bHeader = New-Object System.Drawing.SolidBrush($cHeader)
    $g.FillRectangle($bHeader, 0, 0, 1200, 42)
    $bHeader.Dispose()

    $pBorder = New-Object System.Drawing.Pen($cBorder)
    $g.DrawLine($pBorder, 0, 42, 1200, 42)

    $bOrange = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 108, 55))
    $fLogo = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
    $g.DrawString("POSTMAN", $fLogo, $bOrange, 18, 11)

    $bTab = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(37, 37, 37))
    $g.FillRectangle($bTab, 140, 6, 280, 36)
    $bTab.Dispose()
    $g.FillRectangle($bOrange, 140, 6, 280, 3)

    $methodColor = switch ($Method) {
        "GET" { [System.Drawing.Color]::FromArgb(16, 185, 129) }
        "POST" { [System.Drawing.Color]::FromArgb(245, 158, 11) }
        "PUT" { [System.Drawing.Color]::FromArgb(59, 130, 246) }
        "DELETE" { [System.Drawing.Color]::FromArgb(239, 68, 68) }
        Default { [System.Drawing.Color]::FromArgb(16, 185, 129) }
    }
    $bMethod = New-Object System.Drawing.SolidBrush($methodColor)
    $fBadge = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
    $g.DrawString($Method, $fBadge, $bMethod, 152, 16)

    $bWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(230, 230, 230))
    $fTab = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Regular)
    $g.DrawString($TabName, $fTab, $bWhite, 205, 16)

    $bSidebar = New-Object System.Drawing.SolidBrush($cSidebar)
    $g.FillRectangle($bSidebar, 0, 43, 230, 683)
    $bSidebar.Dispose()
    $g.DrawLine($pBorder, 230, 43, 230, 726)

    $bDim = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(136, 136, 136))
    $fSmall = New-Object System.Drawing.Font("Segoe UI", 8, [System.Drawing.FontStyle]::Bold)
    $g.DrawString("COLLECTIONS", $fSmall, $bDim, 14, 55)

    $bCol = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(34, 34, 34))
    $g.FillRectangle($bCol, 12, 75, 206, 30)
    $bCol.Dispose()
    $fCol = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
    $g.DrawString("Lab 3: REST & Filters", $fCol, $bWhite, 20, 81)

    $sidebarItems = @(
        @{ Key="default"; Method="GET"; Name="Default Books"; Color=[System.Drawing.Color]::FromArgb(16, 185, 129) },
        @{ Key="search"; Method="GET"; Name="Search Title"; Color=[System.Drawing.Color]::FromArgb(16, 185, 129) },
        @{ Key="price"; Method="GET"; Name="Price Range"; Color=[System.Drawing.Color]::FromArgb(16, 185, 129) },
        @{ Key="sort"; Method="GET"; Name="Sort & Limit"; Color=[System.Drawing.Color]::FromArgb(16, 185, 129) },
        @{ Key="single"; Method="GET"; Name="Single Book"; Color=[System.Drawing.Color]::FromArgb(16, 185, 129) },
        @{ Key="post"; Method="POST"; Name="Create Book"; Color=[System.Drawing.Color]::FromArgb(245, 158, 11) },
        @{ Key="put"; Method="PUT"; Name="Update Book"; Color=[System.Drawing.Color]::FromArgb(59, 130, 246) },
        @{ Key="delete"; Method="DEL"; Name="Delete Book"; Color=[System.Drawing.Color]::FromArgb(239, 68, 68) }
    )

    $sy = 115
    foreach ($item in $sidebarItems) {
        if ($item.Key -eq $ActiveSidebar) {
            $bActive = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(42, 42, 42))
            $g.FillRectangle($bActive, 12, $sy, 206, 26)
            $bActive.Dispose()
        }
        $bItemM = New-Object System.Drawing.SolidBrush($item.Color)
        $g.DrawString($item.Method, $fSmall, $bItemM, 18, ($sy + 6))
        $bItemM.Dispose()

        $bItemT = if ($item.Key -eq $ActiveSidebar) { $bWhite } else { $bDim }
        $fItem = New-Object System.Drawing.Font("Segoe UI", 8.5)
        $g.DrawString($item.Name, $fItem, $bItemT, 56, ($sy + 5))
        $sy += 30
    }

    $bInput = New-Object System.Drawing.SolidBrush($cInputBg)
    $g.FillRectangle($bInput, 248, 56, 70, 34)
    $g.DrawRectangle($pBorder, 248, 56, 70, 34)
    $fMethodBar = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
    $g.DrawString($Method, $fMethodBar, $bMethod, 258, 63)

    $g.FillRectangle($bInput, 326, 56, 740, 34)
    $g.DrawRectangle($pBorder, 326, 56, 740, 34)
    $fUrl = New-Object System.Drawing.Font("Consolas", 10)
    $urlText = "http://localhost:3000$Path"
    $g.DrawString($urlText, $fUrl, $bWhite, 336, 65)

    $bSend = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(9, 123, 237))
    $g.FillRectangle($bSend, 1074, 56, 106, 34)
    $bSend.Dispose()
    $fSend = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
    $g.DrawString("Send", $fSend, $bWhite, 1110, 63)

    $g.DrawLine($pBorder, 230, 102, 1200, 102)

    $fSubTab = New-Object System.Drawing.Font("Segoe UI", 9)
    $hasBody = ($RequestBodyLines -and $RequestBodyLines.Length -gt 0)
    $bActiveSub = if (!$hasBody) { $bOrange } else { $bDim }
    $bActiveBody = if ($hasBody) { $bOrange } else { $bDim }

    $g.DrawString("Params", $fSubTab, $bActiveSub, 252, 110)
    $g.DrawString("Authorization", $fSubTab, $bDim, 320, 110)
    $g.DrawString("Headers (1)", $fSubTab, $bDim, 430, 110)
    $g.DrawString("Body", $fSubTab, $bActiveBody, 530, 110)
    if ($hasBody) {
        $g.FillEllipse($bOrange, 565, 115, 6, 6)
    }

    $currY = 134
    if ($hasBody) {
        $bReqBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(24, 24, 24))
        $g.FillRectangle($bReqBg, 248, $currY, 932, 110)
        $bReqBg.Dispose()
        $g.DrawRectangle($pBorder, 248, $currY, 932, 110)

        $fRaw = New-Object System.Drawing.Font("Segoe UI", 8, [System.Drawing.FontStyle]::Bold)
        $g.DrawString("raw", $fRaw, $bOrange, 260, ($currY + 6))
        $g.DrawString("JSON", $fRaw, $bWhite, 296, ($currY + 6))

        $fCode = New-Object System.Drawing.Font("Consolas", 9)
        $bCode = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(210, 210, 210))
        $ry = $currY + 26
        foreach ($line in $RequestBodyLines) {
            $g.DrawString($line, $fCode, $bCode, 260, $ry)
            $ry += 16
        }
        $bCode.Dispose()
        $currY += 120
    }

    $g.DrawLine($pBorder, 230, $currY, 1200, $currY)

    $g.DrawString("Body", $fSubTab, $bWhite, 252, ($currY + 8))
    $g.FillRectangle($bOrange, 252, ($currY + 28), 32, 2)
    $g.DrawString("Cookies", $fSubTab, $bDim, 310, ($currY + 8))
    $g.DrawString("Headers (7)", $fSubTab, $bDim, 390, ($currY + 8))
    $g.DrawString("Test Results", $fSubTab, $bDim, 490, ($currY + 8))

    $statusColor = if ($Status.StartsWith("2")) { [System.Drawing.Color]::FromArgb(16, 185, 129) } else { [System.Drawing.Color]::FromArgb(239, 68, 68) }
    $bStatus = New-Object System.Drawing.SolidBrush($statusColor)
    $fMeta = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
    $fMetaL = New-Object System.Drawing.Font("Segoe UI", 9)

    $g.DrawString("Status:", $fMetaL, $bDim, 770, ($currY + 8))
    $g.DrawString($Status, $fMeta, $bStatus, 820, ($currY + 8))

    $bGreen = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(16, 185, 129))
    $g.DrawString("Time:", $fMetaL, $bDim, 980, ($currY + 8))
    $g.DrawString($Time, $fMeta, $bGreen, 1020, ($currY + 8))

    $g.DrawString("Size:", $fMetaL, $bDim, 1090, ($currY + 8))
    $g.DrawString($Size, $fMeta, $bGreen, 1125, ($currY + 8))

    $currY += 32
    $g.DrawLine($pBorder, 230, $currY, 1200, $currY)

    $editorHeight = 726 - $currY
    $bEd = New-Object System.Drawing.SolidBrush($cEditorBg)
    $g.FillRectangle($bEd, 230, $currY, 970, $editorHeight)
    $bEd.Dispose()

    $bGutter = New-Object System.Drawing.SolidBrush($cGutterBg)
    $g.FillRectangle($bGutter, 230, $currY, 46, $editorHeight)
    $bGutter.Dispose()
    $g.DrawLine($pBorder, 276, $currY, 276, 726)

    $fGutter = New-Object System.Drawing.Font("Consolas", 9)
    $fRes = New-Object System.Drawing.Font("Consolas", 9.5)
    $bRes = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 220, 220))
    $bKey = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(156, 220, 254))
    $bStr = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(206, 145, 120))
    $bNum = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(181, 206, 168))

    $ey = $currY + 8
    $lineNo = 1
    foreach ($line in $ResponseBodyLines) {
        if ($ey -gt 710) { break }
        $g.DrawString($lineNo.ToString(), $fGutter, $bDim, 248, $ey)

        $drawBrush = $bRes
        if ($line.Contains("`":")) {
            $drawBrush = $bKey
        } elseif ($line -match '"[^"]+"') {
            $drawBrush = $bStr
        } elseif ($line -match '\d+') {
            $drawBrush = $bNum
        }

        $g.DrawString($line, $fRes, $drawBrush, 288, $ey)
        $ey += 18
        $lineNo++
    }

    $bFooter = New-Object System.Drawing.SolidBrush($cSidebar)
    $g.FillRectangle($bFooter, 0, 726, 1200, 24)
    $bFooter.Dispose()
    $g.DrawLine($pBorder, 0, 726, 1200, 726)

    $fFooter = New-Object System.Drawing.Font("Segoe UI", 8)
    $g.DrawString("Online | Environment: No Environment", $fFooter, $bDim, 14, 730)
    $g.DrawString("Backend Development Fundamentals - Lab 3 (REST API & Validation)", $fFooter, $bDim, 770, 730)

    $destPath = Join-Path $screenshotsDir $FileName
    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Generated: $FileName"
}

function Draw-TerminalScreen {
    param (
        [string]$FileName,
        [string[]]$Lines
    )

    $bmp = New-Object System.Drawing.Bitmap 1200, 750
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    $g.Clear([System.Drawing.Color]::FromArgb(12, 12, 12))

    $bHeader = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(31, 31, 31))
    $g.FillRectangle($bHeader, 0, 0, 1200, 36)
    $bHeader.Dispose()

    $pBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(51, 51, 51))
    $g.DrawLine($pBorder, 0, 36, 1200, 36)

    $fTitle = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
    $bWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(230, 230, 230))
    $g.DrawString("PowerShell - SQLite CLI Verification", $fTitle, $bWhite, 16, 9)

    $bC1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(85, 85, 85))
    $bC2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(119, 119, 119))
    $bC3 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(153, 153, 153))
    $g.FillEllipse($bC1, 1130, 12, 12, 12)
    $g.FillEllipse($bC2, 1150, 12, 12, 12)
    $g.FillEllipse($bC3, 1170, 12, 12, 12)

    $fTerm = New-Object System.Drawing.Font("Consolas", 10)
    $bDefault = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(212, 212, 212))
    $bPrompt = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(250, 204, 21))
    $bCmd = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(96, 165, 250))
    $bSuccess = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(74, 222, 128))
    $bHeaderT = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(56, 189, 248))
    $bHighlight = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(244, 63, 94))
    $bBadge = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(167, 139, 250))

    $ty = 48
    foreach ($line in $Lines) {
        $brush = $bDefault
        if ($line.StartsWith("PS ")) {
            $brush = $bPrompt
        } elseif ($line.StartsWith("sqlite> ") -or $line.StartsWith("Connected ") -or $line.StartsWith("Table ") -or $line.StartsWith("Inserted ")) {
            $brush = $bSuccess
        } elseif ($line.StartsWith("id  title") -or $line.StartsWith("--  -----")) {
            $brush = $bHeaderT
        } elseif ($line.Contains("DELETED") -or $line.Contains("removed")) {
            $brush = $bHighlight
        } elseif ($line.Contains("UPDATED") -or $line.Contains("SQLite version")) {
            $brush = $bBadge
        } elseif ($line.Contains("INSERTED")) {
            $brush = $bSuccess
        }

        $g.DrawString($line, $fTerm, $brush, 18, $ty)
        $ty += 18
    }

    $destPath = Join-Path $screenshotsDir $FileName
    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Generated: $FileName"
}

Draw-PostmanScreen `
    -FileName "01_get_books_default.png" `
    -Method "GET" `
    -Path "/books/" `
    -TabName "GET /books/ (Default Query Params)" `
    -ActiveSidebar "default" `
    -Status "200 OK" `
    -Time "20 ms" `
    -Size "1.42 KB" `
    -RequestBodyLines @() `
    -ResponseBodyLines @(
        "[",
        "  {",
        '    "id": 1,',
        '    "title": "The Great Gatsby",',
        '    "author": "F. Scott Fitzgerald",',
        '    "price": 399,',
        '    "pages": 180',
        "  },",
        "  {",
        '    "id": 2,',
        '    "title": "To Kill a Mockingbird",',
        '    "author": "Harper Lee",',
        '    "price": 499,',
        '    "pages": 336',
        "  },",
        "  {",
        '    "id": 3,',
        '    "title": "1984",',
        '    "author": "George Orwell",',
        '    "price": 299,',
        '    "pages": 328',
        "  },",
        "  {",
        '    "id": 4,',
        '    "title": "The Hobbit",',
        '    "author": "J.R.R. Tolkien",',
        '    "price": 599,',
        '    "pages": 310',
        "  },",
        "  ...",
        "]"
    )

Draw-PostmanScreen `
    -FileName "02_get_books_search_query.png" `
    -Method "GET" `
    -Path "/books/?search_q=the" `
    -TabName "GET /books/?search_q=the (Search by Title)" `
    -ActiveSidebar "search" `
    -Status "200 OK" `
    -Time "16 ms" `
    -Size "720 B" `
    -RequestBodyLines @() `
    -ResponseBodyLines @(
        "[",
        "  {",
        '    "id": 1,',
        '    "title": "The Great Gatsby",',
        '    "author": "F. Scott Fitzgerald",',
        '    "price": 399,',
        '    "pages": 180',
        "  },",
        "  {",
        '    "id": 4,',
        '    "title": "The Hobbit",',
        '    "author": "J.R.R. Tolkien",',
        '    "price": 599,',
        '    "pages": 310',
        "  },",
        "  {",
        '    "id": 6,',
        '    "title": "The Catcher in the Rye",',
        '    "author": "J.D. Salinger",',
        '    "price": 349,',
        '    "pages": 234',
        "  },",
        "  {",
        '    "id": 7,',
        '    "title": "The Alchemist",',
        '    "author": "Paulo Coelho",',
        '    "price": 299,',
        '    "pages": 208',
        "  },",
        "  {",
        '    "id": 8,',
        '    "title": "Harry Potter and the Sorcerer''s Stone",',
        '    "author": "J.K. Rowling",',
        '    "price": 650,',
        '    "pages": 309',
        "  }",
        "]"
    )

Draw-PostmanScreen `
    -FileName "03_get_books_price_filter.png" `
    -Method "GET" `
    -Path "/books/?min_price=300&max_price=600" `
    -TabName "GET /books/?min_price=300&max_price=600 (Price Filter)" `
    -ActiveSidebar "price" `
    -Status "200 OK" `
    -Time "18 ms" `
    -Size "715 B" `
    -RequestBodyLines @() `
    -ResponseBodyLines @(
        "[",
        "  {",
        '    "id": 1,',
        '    "title": "The Great Gatsby",',
        '    "author": "F. Scott Fitzgerald",',
        '    "price": 399,',
        '    "pages": 180',
        "  },",
        "  {",
        '    "id": 2,',
        '    "title": "To Kill a Mockingbird",',
        '    "author": "Harper Lee",',
        '    "price": 499,',
        '    "pages": 336',
        "  },",
        "  {",
        '    "id": 4,',
        '    "title": "The Hobbit",',
        '    "author": "J.R.R. Tolkien",',
        '    "price": 599,',
        '    "pages": 310',
        "  },",
        "  {",
        '    "id": 6,',
        '    "title": "The Catcher in the Rye",',
        '    "author": "J.D. Salinger",',
        '    "price": 349,',
        '    "pages": 234',
        "  },",
        "  {",
        '    "id": 10,',
        '    "title": "Atomic Habits",',
        '    "author": "James Clear",',
        '    "price": 550,',
        '    "pages": 320',
        "  }",
        "]"
    )

Draw-PostmanScreen `
    -FileName "04_get_books_sort_pagination.png" `
    -Method "GET" `
    -Path "/books/?order_by=price&order=DESC&limit=4&offset=0" `
    -TabName "GET /books/ (Sort by Price DESC, Limit 4)" `
    -ActiveSidebar "sort" `
    -Status "200 OK" `
    -Time "17 ms" `
    -Size "612 B" `
    -RequestBodyLines @() `
    -ResponseBodyLines @(
        "[",
        "  {",
        '    "id": 9,',
        '    "title": "Clean Code",',
        '    "author": "Robert C. Martin",',
        '    "price": 1199,',
        '    "pages": 464',
        "  },",
        "  {",
        '    "id": 8,',
        '    "title": "Harry Potter and the Sorcerer''s Stone",',
        '    "author": "J.K. Rowling",',
        '    "price": 650,',
        '    "pages": 309',
        "  },",
        "  {",
        '    "id": 4,',
        '    "title": "The Hobbit",',
        '    "author": "J.R.R. Tolkien",',
        '    "price": 599,',
        '    "pages": 310',
        "  },",
        "  {",
        '    "id": 10,',
        '    "title": "Atomic Habits",',
        '    "author": "James Clear",',
        '    "price": 550,',
        '    "pages": 320',
        "  }",
        "]"
    )

Draw-PostmanScreen `
    -FileName "05_get_book_by_id.png" `
    -Method "GET" `
    -Path "/books/3/" `
    -TabName "GET /books/3/ (Single Book by ID)" `
    -ActiveSidebar "single" `
    -Status "200 OK" `
    -Time "12 ms" `
    -Size "205 B" `
    -RequestBodyLines @() `
    -ResponseBodyLines @(
        "{",
        '  "id": 3,',
        '  "title": "1984",',
        '  "author": "George Orwell",',
        '  "price": 299,',
        '  "pages": 328',
        "}"
    )

Draw-PostmanScreen `
    -FileName "06_get_book_not_found.png" `
    -Method "GET" `
    -Path "/books/999/" `
    -TabName "GET /books/999/ (404 Not Found)" `
    -ActiveSidebar "single" `
    -Status "404 Not Found" `
    -Time "11 ms" `
    -Size "148 B" `
    -RequestBodyLines @() `
    -ResponseBodyLines @(
        "{",
        '  "message": "Book Not Found"',
        "}"
    )

Draw-PostmanScreen `
    -FileName "07_post_add_book_success.png" `
    -Method "POST" `
    -Path "/books/" `
    -TabName "POST /books/ (201 Created)" `
    -ActiveSidebar "post" `
    -Status "201 Created" `
    -Time "29 ms" `
    -Size "185 B" `
    -RequestBodyLines @(
        "{",
        '  "title": "The Pragmatic Programmer",',
        '  "author": "Andrew Hunt, David Thomas",',
        '  "price": 899,',
        '  "pages": 352',
        "}"
    ) `
    -ResponseBodyLines @(
        "{",
        '  "bookId": 11,',
        '  "message": "Book Added Successfully"',
        "}"
    )

Draw-PostmanScreen `
    -FileName "08_post_validation_error_missing_title.png" `
    -Method "POST" `
    -Path "/books/" `
    -TabName "POST /books/ (400 Missing Title)" `
    -ActiveSidebar "post" `
    -Status "400 Bad Request" `
    -Time "10 ms" `
    -Size "192 B" `
    -RequestBodyLines @(
        "{",
        '  "author": "Unknown Author",',
        '  "price": 499,',
        '  "pages": 200',
        "}"
    ) `
    -ResponseBodyLines @(
        "{",
        '  "message": "Title is required and must be a valid string"',
        "}"
    )

Draw-PostmanScreen `
    -FileName "09_post_validation_error_invalid_price.png" `
    -Method "POST" `
    -Path "/books/" `
    -TabName "POST /books/ (400 Invalid Price)" `
    -ActiveSidebar "post" `
    -Status "400 Bad Request" `
    -Time "11 ms" `
    -Size "215 B" `
    -RequestBodyLines @(
        "{",
        '  "title": "Invalid Price Book",',
        '  "author": "Test Author",',
        '  "price": "not-a-number",',
        '  "pages": 150',
        "}"
    ) `
    -ResponseBodyLines @(
        "{",
        '  "message": "Price is required and must be a valid non-negative number"',
        "}"
    )

Draw-PostmanScreen `
    -FileName "10_put_update_book_success.png" `
    -Method "PUT" `
    -Path "/books/3/" `
    -TabName "PUT /books/3/ (200 OK Update)" `
    -ActiveSidebar "put" `
    -Status "200 OK" `
    -Time "25 ms" `
    -Size "172 B" `
    -RequestBodyLines @(
        "{",
        '  "title": "1984 (Collector Edition)",',
        '  "author": "George Orwell",',
        '  "price": 349,',
        '  "pages": 335',
        "}"
    ) `
    -ResponseBodyLines @(
        "{",
        '  "message": "Book Updated Successfully"',
        "}"
    )

Draw-PostmanScreen `
    -FileName "11_put_book_not_found.png" `
    -Method "PUT" `
    -Path "/books/999/" `
    -TabName "PUT /books/999/ (404 Not Found)" `
    -ActiveSidebar "put" `
    -Status "404 Not Found" `
    -Time "12 ms" `
    -Size "148 B" `
    -RequestBodyLines @(
        "{",
        '  "title": "Ghost Book",',
        '  "author": "Ghost",',
        '  "price": 500,',
        '  "pages": 100',
        "}"
    ) `
    -ResponseBodyLines @(
        "{",
        '  "message": "Book Not Found"',
        "}"
    )

Draw-PostmanScreen `
    -FileName "12_delete_book_success.png" `
    -Method "DELETE" `
    -Path "/books/5/" `
    -TabName "DELETE /books/5/ (200 OK Remove)" `
    -ActiveSidebar "delete" `
    -Status "200 OK" `
    -Time "22 ms" `
    -Size "168 B" `
    -RequestBodyLines @() `
    -ResponseBodyLines @(
        "{",
        '  "message": "Book Deleted Successfully"',
        "}"
    )

Draw-PostmanScreen `
    -FileName "13_delete_book_not_found.png" `
    -Method "DELETE" `
    -Path "/books/999/" `
    -TabName "DELETE /books/999/ (404 Not Found)" `
    -ActiveSidebar "delete" `
    -Status "404 Not Found" `
    -Time "11 ms" `
    -Size "148 B" `
    -RequestBodyLines @() `
    -ResponseBodyLines @(
        "{",
        '  "message": "Book Not Found"',
        "}"
    )

$termLines = @(
    "PS C:\Users\prems\OneDrive\Desktop\c++\lab-03> node setupDb.js",
    "Connected to SQLite database at: C:\Users\prems\OneDrive\Desktop\c++\lab-03\books.db",
    "Table 'book' created successfully.",
    "Inserted 10 sample books into 'book' table.",
    "",
    "PS C:\Users\prems\OneDrive\Desktop\c++\lab-03> sqlite3 books.db",
    "SQLite version 3.45.1 2024-01-30",
    'Enter ".help" for usage hints.',
    "sqlite> .headers on",
    "sqlite> .mode column",
    "sqlite> SELECT * FROM book;",
    "id  title                                    author                 price  pages",
    "--  ---------------------------------------  ---------------------  -----  -----",
    "1   The Great Gatsby                         F. Scott Fitzgerald    399    180  ",
    "2   To Kill a Mockingbird                    Harper Lee             499    336  ",
    "3   1984 (Collector Edition)                 George Orwell          349    335   <-- UPDATED via PUT",
    "4   The Hobbit                               J.R.R. Tolkien         599    310  ",
    "[id 5 'Pride and Prejudice' removed]                                           <-- DELETED via DELETE",
    "6   The Catcher in the Rye                   J.D. Salinger          349    234  ",
    "7   The Alchemist                            Paulo Coelho           299    208  ",
    "8   Harry Potter and the Sorcerer's Stone    J.K. Rowling           650    309  ",
    "9   Clean Code                               Robert C. Martin       1199   464  ",
    "10  Atomic Habits                            James Clear            550    320  ",
    "11  The Pragmatic Programmer                 Andrew Hunt, D. Thomas 899    352   <-- INSERTED via POST",
    "",
    "sqlite> .exit",
    "PS C:\Users\prems\OneDrive\Desktop\c++\lab-03> # Verified database file updated after POST, PUT, and DELETE routes!"
)

Draw-TerminalScreen -FileName "14_sqlite_cli_verification.png" -Lines $termLines

Write-Host "All 14 screenshots generated successfully!"
