const { test, expect } = require('@playwright/test');

test.describe('오퍼센트 로그인 기능 테스트', () => {
  test('로그인 버튼 클릭 시 모달창 확인', async ({ page }) => {
    // 페이지 이동
    await page.goto('https://offercent.co.kr/company-list?jobCategories=0010001');
    
    // 페이지 로딩 대기
    await page.waitForLoadState('networkidle');
    
    // 로그인 버튼 찾기 (여러 가능한 선택자 시도)
    const loginButton = page.locator('text=로그인').or(
      page.locator('[data-testid*="login"]')
    ).or(
      page.locator('button:has-text("로그인")')
    ).or(
      page.locator('a:has-text("로그인")')
    ).first();
    
    // 로그인 버튼이 존재하는지 확인
    await expect(loginButton).toBeVisible();
    
    // 로그인 버튼 클릭
    await loginButton.click();
    
    // 모달창이 나타날 때까지 대기
    await page.waitForTimeout(1000);
    
    // "성장하는 기업들의 채용 소식" 텍스트 확인
    const growthText = page.locator('text=성장하는 기업들의 채용 소식');
    await expect(growthText).toBeVisible();
    
    // "카카오 로그인" 버튼 확인
    const kakaoLoginButton = page.locator('text=카카오 로그인').or(
      page.locator('button:has-text("카카오 로그인")')
    ).or(
      page.locator('[data-testid*="kakao"]')
    ).or(
      page.locator('button:has-text("카카오")')
    );
    
    await expect(kakaoLoginButton).toBeVisible();
    
    console.log('✅ 로그인 모달창에서 모든 요소가 정상적으로 확인되었습니다.');
  });
});