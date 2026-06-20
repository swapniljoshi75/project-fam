import { chromium } from 'playwright'
import { mkdir } from 'fs/promises'
await mkdir('/tmp/fam3', { recursive: true })

const browser = await chromium.launch({ headless: true })
const page = await (await browser.newContext({ viewport: { width: 1400, height: 900 } })).newPage()

await page.goto('http://localhost:5173/')
await page.evaluate(() => localStorage.clear())
await page.reload()
await page.waitForLoadState('networkidle')

// Setup
await page.fill('input[placeholder="Choose a password"]', 'test123')
await page.fill('input[placeholder="Repeat password"]', 'test123')
await page.locator('.modal button:has-text("Set Password")').click()
await page.waitForTimeout(600)
await page.screenshot({ path: '/tmp/fam3/01-empty.png' })

// Add root ancestor
await page.locator('header button:has-text("+ Add Member")').click()
await page.fill('input[placeholder="Enter full name"]', 'Dada Sharma')
await page.locator('.modal button:has-text("★ New ancestor")').click()
await page.locator('.modal .form-actions button:has-text("+ Add")').click()
await page.waitForTimeout(600)
await page.screenshot({ path: '/tmp/fam3/02-root.png' })
console.log('Root renders in React Flow:', await page.locator('.react-flow__node').count() > 0)
console.log('MUI Card visible:', await page.locator('.MuiCard-root').first().isVisible())

// Add wife to root
await page.locator('button:has-text("+ Add Wife")').click()
await page.waitForTimeout(200)
await page.fill('input[placeholder="Enter full name"]', 'Dadi Sharma')
await page.locator('.modal label:has-text("♀ Female")').click()
await page.locator('.modal .form-actions button:has-text("+ Add")').click()
await page.waitForTimeout(500)
await page.screenshot({ path: '/tmp/fam3/03-with-wife.png' })
console.log('Wife pink row visible:', await page.locator('text=Dadi Sharma').isVisible())

// Add 3 sons + 2 daughters
for (const [name, gender] of [
  ['Ramesh Sharma', 'male'], ['Suresh Sharma', 'male'], ['Mahesh Sharma', 'male'],
  ['Geeta Sharma', 'female'], ['Seeta Sharma', 'female'],
]) {
  await page.locator('header button:has-text("+ Add Member")').click()
  await page.waitForTimeout(200)
  await page.fill('input[placeholder="Enter full name"]', name)
  if (gender === 'female') await page.locator('.modal label:has-text("♀ Female")').click()
  await page.locator('.modal button:has-text("↓ Child of")').click()
  await page.waitForTimeout(100)
  await page.selectOption('.modal select', { label: 'Dada Sharma' })
  await page.locator('.modal .form-actions button:has-text("+ Add")').click()
  await page.waitForTimeout(400)
}

await page.screenshot({ path: '/tmp/fam3/04-five-children.png', fullPage: false })
console.log('Node count:', await page.locator('.react-flow__node').count())

// Add grandchildren to Ramesh
for (const name of ['Ravi Sharma', 'Priya Sharma']) {
  await page.locator('header button:has-text("+ Add Member")').click()
  await page.waitForTimeout(200)
  await page.fill('input[placeholder="Enter full name"]', name)
  await page.locator('.modal button:has-text("↓ Child of")').click()
  await page.waitForTimeout(100)
  await page.selectOption('.modal select', { label: 'Ramesh Sharma' })
  await page.locator('.modal .form-actions button:has-text("+ Add")').click()
  await page.waitForTimeout(400)
}

await page.screenshot({ path: '/tmp/fam3/05-grandchildren.png', fullPage: false })
console.log('MiniMap visible:', await page.locator('.react-flow__minimap').isVisible())
console.log('Controls visible:', await page.locator('.react-flow__controls').isVisible())
console.log('Total nodes:', await page.locator('.react-flow__node').count())

// Test zoom in/out with controls
await page.locator('.react-flow__controls-zoomout').click()
await page.locator('.react-flow__controls-zoomout').click()
await page.waitForTimeout(300)
await page.screenshot({ path: '/tmp/fam3/06-zoomed-out.png' })

// Fit view
await page.locator('.react-flow__controls-fitview').click()
await page.waitForTimeout(500)
await page.screenshot({ path: '/tmp/fam3/07-fit-view.png' })

console.log('\n✅ Done. Screenshots at /tmp/fam3/')
await browser.close()
