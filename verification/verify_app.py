from playwright.sync_api import sync_playwright

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Dashboard
        page.goto("http://localhost:3000/dashboard")
        page.screenshot(path="verification/dashboard.png")
        print("Dashboard screenshot taken.")

        # 2. Waiting Room (using a test project ID)
        # Using the project ID we created earlier via curl: 093dad08-8cc1-4a9d-bf50-c65243055491
        page.goto("http://localhost:3000/waiting-room/093dad08-8cc1-4a9d-bf50-c65243055491")
        # Wait for potential socket connection and update
        page.wait_for_timeout(2000)
        page.screenshot(path="verification/waiting_room.png")
        print("Waiting Room screenshot taken.")

        browser.close()

if __name__ == "__main__":
    verify_frontend()
