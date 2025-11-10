# PHẢN BIỆN HỆ THỐNG - PHẦN FRONTEND REACTJS

## Electric Vehicle Dealer Management System

**Vai trò:** Giảng viên Hội đồng  
**Ngày:** [Ngày phản biện]  
**Sinh viên:** [Tên sinh viên]

---

## I. KIẾN TRÚC VÀ CẤU TRÚC DỰ ÁN

### Câu hỏi 1: Cấu trúc thư mục và tổ chức code

**Hỏi:** "Tôi thấy dự án có cấu trúc thư mục khá rõ ràng với `components`, `pages`, `services`, `hooks`, `contexts`. Tuy nhiên, tôi muốn hỏi:

1. **Tại sao bạn chọn cấu trúc này thay vì các pattern khác như Feature-based structure hoặc Atomic Design?**
2. **Làm thế nào bạn đảm bảo tính nhất quán trong cách tổ chức code khi có nhiều developers làm việc cùng?**
3. **Có quy tắc naming convention nào được áp dụng không? Tôi thấy có sự không nhất quán giữa `AuthService.js` và `customerApi.js` (một cái có chữ A viết hoa, một cái không)."**

**Điểm cần làm rõ:**

- Tính nhất quán trong naming conventions
- Scalability của cấu trúc hiện tại
- Maintainability khi project lớn hơn

---

### Câu hỏi 2: Build tool và Development setup

**Hỏi:** "Dự án sử dụng Vite làm build tool. Tôi thấy cấu hình khá đơn giản:

1. **Tại sao chọn Vite thay vì Create React App hoặc Next.js?**
2. **Có cấu hình optimization nào cho production build không? (code splitting, tree shaking, minification)**
3. \*\*Làm thế nào bạn handle environment variables? Tôi thấy có `import.meta.env.VITE_API_BASE_URL` nhưng không thấy file `.env.example`."
4. **Có setup CI/CD pipeline không? Làm thế nào đảm bảo code quality trước khi deploy?"**

**Điểm cần làm rõ:**

- Build optimization strategies
- Environment management
- Deployment process

---

## II. STATE MANAGEMENT

### Câu hỏi 3: State Management Strategy

**Hỏi:** "Tôi thấy dự án sử dụng React Hooks (useState, useEffect) và Context API (ToastProvider) cho state management, nhưng không có Redux, Zustand hay các state management library khác.

1. **Tại sao bạn chọn approach này? Với một hệ thống phức tạp như này (4 actors, nhiều features), liệu local state và Context API có đủ không?**
2. **Tôi thấy có nhiều components sử dụng `useState` cho cùng một loại data (ví dụ: `loading`, `error`). Có cách nào centralize state management không?**
3. \*\*Làm thế nào bạn handle state synchronization giữa các components khác nhau? Ví dụ: khi tạo order mới, làm sao OrderManagement component biết để refresh data?"
4. **Có vấn đề gì về performance khi sử dụng Context API với nhiều consumers không? Làm thế nào bạn optimize re-renders?"**

**Điểm cần làm rõ:**

- State management strategy cho large-scale application
- Performance implications
- Data synchronization patterns

---

### Câu hỏi 4: Custom Hooks Pattern

**Hỏi:** "Tôi thấy bạn có nhiều custom hooks như `useOrderApi`, `useQuoteApi`, `useContractApi`. Đây là một pattern tốt.

1. **Tuy nhiên, tôi thấy có sự trùng lặp code giữa các hooks này (cùng pattern `handleApiCall`, `loading`, `error`). Có cách nào DRY (Don't Repeat Yourself) hơn không?**
2. **Có một base hook như `useApi` để các hooks khác extend không?**
3. **Làm thế nào bạn handle caching và data invalidation trong các hooks này?**
4. **Có retry logic khi API call fails không?"**

**Điểm cần làm rõ:**

- Code reusability
- Error handling patterns
- Caching strategies

---

## III. PERFORMANCE OPTIMIZATION

### Câu hỏi 5: React Performance Optimization

**Hỏi:** "Tôi thấy codebase sử dụng `useCallback`, `useMemo` ở một số nơi, nhưng không phải tất cả.

1. **Tiêu chí nào bạn dùng để quyết định khi nào cần `useCallback`/`useMemo`?**
2. **Có phân tích performance bằng React DevTools Profiler không? Có components nào bị re-render không cần thiết không?**
3. **Tôi thấy có 205 matches của `useEffect`, `useMemo`, `useCallback` trong codebase. Có risk về over-optimization không?**
4. \*\*Làm thế nào bạn handle code splitting và lazy loading? Tôi không thấy `React.lazy()` hoặc `Suspense` trong App.jsx."
5. **Với 4 actor pages và nhiều components, bundle size là bao nhiêu? Có cách nào giảm initial load time không?"**

**Điểm cần làm rõ:**

- Performance optimization strategy
- Bundle size management
- Lazy loading implementation

---

### Câu hỏi 6: API Call Optimization

**Hỏi:** "Tôi thấy mỗi component tự quản lý API calls riêng.

1. **Có vấn đề về duplicate API calls không? Ví dụ: nhiều components cùng gọi API để lấy danh sách products.**
2. **Có implement request cancellation khi component unmount không?**
3. \*\*Có debounce/throttle cho search inputs không? Tôi thấy có `debouncedSearchTerm` trong QuotationManagement nhưng không thấy ở các components khác."
4. **Làm thế nào bạn handle pagination? Tôi thấy có client-side pagination (DebtManagement) và server-side pagination. Tiêu chí nào để chọn approach nào?"**

**Điểm cần làm rõ:**

- API call optimization
- Request deduplication
- Pagination strategies

---

## IV. SECURITY

### Câu hỏi 7: Authentication và Authorization

**Hỏi:** "Tôi thấy authentication được implement với JWT token stored trong localStorage.

1. **Tại sao chọn localStorage thay vì sessionStorage hoặc httpOnly cookies? Có risk về XSS attacks không?**
2. **Token được decode ở client-side bằng `atob()`. Có validate token expiration không?**
3. **Tôi thấy `ProtectedRoute` chỉ check `isAuthenticated()` và `userRole`. Có check token expiration không?**
4. \*\*Có implement token refresh mechanism không? Làm thế nào handle khi token hết hạn?"
5. **Có rate limiting hoặc protection chống brute force attacks ở frontend không?"**

**Điểm cần làm rõ:**

- Security best practices
- Token management
- XSS/CSRF protection

---

### Câu hỏi 8: Data Validation và Sanitization

**Hỏi:** "Tôi thấy có validation ở một số forms (AddCustomerForm có regex validation).

1. **Có consistent validation strategy không? Tất cả forms đều có validation chưa?**
2. \*\*Có sử dụng validation library như Yup, Zod, hoặc Formik không? Tôi thấy validation được implement manually."
3. **Có sanitize user inputs trước khi gửi lên server không?**
4. \*\*Làm thế nào bạn handle sensitive data (passwords, tokens) trong console logs? Tôi thấy có một số `console.log` trong code."

**Điểm cần làm rõ:**

- Input validation strategy
- Data sanitization
- Security logging

---

## V. ERROR HANDLING

### Câu hỏi 9: Error Handling Strategy

**Hỏi:** "Tôi thấy có error handling ở nhiều levels: axios interceptors, custom hooks, và components.

1. **Có Error Boundary component không? Làm thế nào handle React errors (component crashes)?**
2. **Error messages được hiển thị như thế nào? Tôi thấy có Toast notifications, nhưng có consistent error message format không?**
3. **Có logging mechanism cho errors không? Làm thế nào track errors trong production?**
4. \*\*Khi API call fails, có retry logic không? Có fallback UI không?"
5. **Có handle network errors (offline, timeout) khác với server errors không?"**

**Điểm cần làm rõ:**

- Error handling architecture
- User experience khi có errors
- Error monitoring và logging

---

### Câu hỏi 10: API Error Handling

**Hỏi:** "Tôi thấy có `handleApiError` function trong `utils.js` và axios interceptors.

1. **Có centralized error handling không? Tất cả API errors đều được handle giống nhau không?**
2. **Làm thế nào bạn differentiate giữa different error types (400, 401, 403, 404, 500)?**
3. \*\*Có user-friendly error messages không? Tôi thấy có một số technical error messages có thể confuse users."
4. \*\*Khi có 401 (unauthorized), có redirect về login page không? Tôi thấy có trong interceptor nhưng có handle edge cases không?"

**Điểm cần làm rõ:**

- Error handling consistency
- User experience
- Edge cases handling

---

## VI. CODE QUALITY VÀ BEST PRACTICES

### Câu hỏi 11: Code Quality và Maintainability

**Hỏi:** "Tôi thấy codebase khá lớn với nhiều components.

1. **Có code review process không? Làm thế nào đảm bảo code quality?**
2. **Có coding standards hoặc style guide không? Tôi thấy có ESLint config nhưng có enforce strict rules không?**
3. **Có TypeScript không? Tại sao chọn JavaScript thay vì TypeScript cho một project lớn như này?**
4. \*\*Có unit tests, integration tests không? Test coverage là bao nhiêu?"
5. \*\*Có documentation cho components, hooks, services không? Tôi thấy có JSDoc comments ở một số nơi nhưng không phải tất cả."

**Điểm cần làm rõ:**

- Code quality assurance
- Testing strategy
- Documentation

---

### Câu hỏi 12: Component Design Patterns

**Hỏi:** "Tôi thấy có nhiều components với nhiều responsibilities.

1. \*\*Có follow Single Responsibility Principle không? Một số components như `QuotationManagement` có nhiều logic (state management, API calls, UI rendering)."
2. \*\*Có reusable components không? Tôi thấy có `CustomDropdown`, `Toast`, nhưng có thể reuse nhiều hơn không?"
3. \*\*Có component composition patterns không? Làm thế nào handle prop drilling?"
4. \*\*Có sử dụng design patterns như HOC, Render Props, hoặc Compound Components không?"

**Điểm cần làm rõ:**

- Component architecture
- Reusability
- Design patterns

---

## VII. ROUTING VÀ NAVIGATION

### Câu hỏi 13: Routing Strategy

**Hỏi:** "Tôi thấy sử dụng React Router v7 với `BrowserRouter` và `ProtectedRoute`.

1. **Có nested routes không? Tại sao không sử dụng nested routes cho các sub-pages?**
2. **Có route guards hoặc route-based code splitting không?**
3. \*\*Làm thế nào handle deep linking? Ví dụ: user bookmark một specific order detail page."
4. \*\*Có 404 page không? Tôi thấy có catch-all route redirect về default, nhưng có 404 page không?"
5. \*\*Có breadcrumb navigation không? Với nhiều levels của pages, làm thế nào user biết họ đang ở đâu?"

**Điểm cần làm rõ:**

- Routing architecture
- Navigation UX
- Deep linking support

---

## VIII. DEPENDENCIES VÀ VERSION MANAGEMENT

### Câu hỏi 14: Dependency Management

**Hỏi:** "Tôi thấy package.json có một số dependencies.

1. **Có dependency audit không? Có security vulnerabilities không?**
2. **Tại sao sử dụng React 19.1.1 (version mới nhất)? Có risk về stability không?**
3. \*\*Có lock file (package-lock.json) không? Làm thế nào đảm bảo consistent dependencies across environments?"
4. \*\*Có unused dependencies không? Có cách nào detect và remove không?"
5. \*\*Có peer dependencies issues không? Ví dụ: React Router v7 có compatible với React 19 không?"

**Điểm cần làm rõ:**

- Dependency management strategy
- Security considerations
- Version compatibility

---

## IX. UI/UX VÀ ACCESSIBILITY

### Câu hỏi 15: UI/UX Consistency

**Hỏi:** "Tôi thấy có nhiều CSS files riêng cho từng component.

1. \*\*Có design system hoặc component library không? Làm thế nào đảm bảo UI consistency?"
2. \*\*Có CSS-in-JS solution (styled-components, emotion) không? Tại sao chọn plain CSS?"
3. \*\*Có responsive design cho mobile/tablet không? Tôi thấy có một số media queries nhưng có test trên real devices không?"
4. \*\*Có dark mode support không?"
5. \*\*Có loading states và skeleton screens không? User experience khi data đang load như thế nào?"

**Điểm cần làm rõ:**

- Design system
- Responsive design
- Loading states

---

### Câu hỏi 16: Accessibility

**Hỏi:** "Tôi muốn hỏi về accessibility.

1. **Có follow WCAG guidelines không? Có keyboard navigation support không?**
2. **Có ARIA labels cho interactive elements không?**
3. **Có screen reader support không?**
4. \*\*Có color contrast đạt chuẩn không?"
5. \*\*Có focus management cho modals và dynamic content không?"

**Điểm cần làm rõ:**

- Accessibility compliance
- Inclusive design

---

## X. TESTING

### Câu hỏi 17: Testing Strategy

**Hỏi:** "Tôi không thấy test files trong project structure.

1. **Có testing strategy không? Tại sao không có tests?**
2. \*\*Có plan để implement tests không? Sẽ dùng testing library nào (Jest, React Testing Library, Vitest)?"
3. \*\*Làm thế nào đảm bảo code quality và prevent regressions không có tests?"
4. \*\*Có manual testing checklist không?"
5. \*\*Có E2E tests không? Sẽ dùng tool nào (Cypress, Playwright)?"

**Điểm cần làm rõ:**

- Testing strategy
- Quality assurance without tests
- Future testing plans

---

## XI. SCALABILITY VÀ MAINTAINABILITY

### Câu hỏi 18: Scalability

**Hỏi:** "Với một hệ thống lớn như này, tôi muốn hỏi về scalability.

1. **Làm thế nào hệ thống scale khi có nhiều users hơn? Có performance bottlenecks không?**
2. **Có plan để migrate sang micro-frontends không?**
3. \*\*Làm thế nào handle khi codebase lớn hơn? Có plan để refactor không?"
4. \*\*Có module federation hoặc code splitting strategy cho large-scale deployment không?"
5. \*\*Làm thế nào onboard new developers vào project? Có documentation và onboarding process không?"

**Điểm cần làm rõ:**

- Scalability planning
- Code organization for growth
- Team collaboration

---

### Câu hỏi 19: Maintainability

**Hỏi:** "Về maintainability:

1. **Có technical debt không? Có plan để address không?**
2. \*\*Có code refactoring strategy không? Làm thế nào đảm bảo refactoring không break existing features?"
3. \*\*Có deprecation strategy cho old code không?"
4. \*\*Có migration guides khi có breaking changes không?"
5. \*\*Làm thế nào track và manage dependencies updates?"

**Điểm cần làm rõ:**

- Technical debt management
- Refactoring strategy
- Long-term maintainability

---

## XII. INTEGRATION VÀ DEPLOYMENT

### Câu hỏi 20: Backend Integration

**Hỏi:** "Về integration với backend:

1. \*\*Có API contract documentation không? Làm thế nào đảm bảo frontend và backend sync?"
2. \*\*Có API versioning strategy không? Làm thế nào handle API changes?"
3. \*\*Có mock data hoặc API mocking cho development không?"
4. \*\*Có integration tests với backend không?"
5. \*\*Làm thế nào handle backward compatibility khi API changes?"

**Điểm cần làm rõ:**

- API integration strategy
- Versioning và compatibility
- Development workflow

---

### Câu hỏi 21: Deployment

**Hỏi:** "Về deployment:

1. **Deployment process như thế nào? Có CI/CD pipeline không?**
2. **Deploy ở đâu? (Vercel, Netlify, AWS, etc.)**
3. \*\*Có environment management (dev, staging, production) không?"
4. \*\*Có rollback strategy không? Làm thế nào handle khi deployment fails?"
5. \*\*Có monitoring và analytics không? Làm thế nào track errors và performance trong production?"

**Điểm cần làm rõ:**

- Deployment strategy
- Environment management
- Monitoring và observability

---

## TỔNG KẾT CÁC ĐIỂM CẦN LÀM RÕ

### Điểm mạnh:

1. ✅ Cấu trúc code rõ ràng, tổ chức tốt
2. ✅ Sử dụng custom hooks pattern tốt
3. ✅ Có error handling ở nhiều levels
4. ✅ Protected routes implementation
5. ✅ Context API cho global state (Toast)

### Điểm cần cải thiện:

1. ⚠️ Thiếu testing strategy
2. ⚠️ Thiếu Error Boundary
3. ⚠️ Có thể optimize performance hơn (code splitting, lazy loading)
4. ⚠️ Security concerns (localStorage cho tokens, XSS risks)
5. ⚠️ Thiếu centralized state management cho complex state
6. ⚠️ Có thể improve code reusability (DRY principle)
7. ⚠️ Thiếu TypeScript cho type safety
8. ⚠️ Cần improve documentation
9. ⚠️ Cần accessibility improvements
10. ⚠️ Cần dependency audit và security checks

---

**Lưu ý cho sinh viên:** Đây là các câu hỏi phản biện để chuẩn bị bảo vệ. Hãy chuẩn bị câu trả lời chi tiết cho từng câu hỏi, có thể kèm code examples và demonstrations.

---

# PHẦN CÂU TRẢ LỜI CHI TIẾT

## I. KIẾN TRÚC VÀ CẤU TRÚC DỰ ÁN

### Câu hỏi 1: Cấu trúc thư mục và tổ chức code

**Trả lời:**

1. **Lý do chọn cấu trúc hiện tại:**

   - **Lý do chính:** Dự án được thiết kế với 4 actors (DealerStaff, DealerManager, EVMStaff, Admin), mỗi actor có các features riêng. Cấu trúc hiện tại (component-based) phù hợp vì:
     - Dễ tìm và maintain code: `components/dealerStaff/`, `components/admin/`, etc.
     - Tách biệt rõ ràng giữa các layers: `pages/` (routing), `components/` (UI), `services/` (API), `hooks/` (logic)
     - Dễ scale: khi thêm feature mới, chỉ cần thêm vào folder tương ứng
   - **So với Feature-based:** Feature-based tốt cho monorepo lớn, nhưng với project này, component-based đơn giản hơn và đủ dùng
   - **So với Atomic Design:** Atomic Design phức tạp hơn cần thiết cho project này, và có thể gây confusion khi có nhiều developers

2. **Đảm bảo tính nhất quán:**

   - **Hiện tại:** Sử dụng ESLint với rules cơ bản (`eslint.config.js`)
   - **Cải thiện cần thiết:**
     - Tạo coding standards document
     - Setup Prettier cho code formatting
     - Code review checklist
     - Naming convention guide (PascalCase cho components, camelCase cho functions, etc.)

3. **Naming convention:**
   - **Thừa nhận:** Có sự không nhất quán giữa `AuthService.js` (PascalCase) và `customerApi.js` (camelCase)
   - **Lý do:**
     - `AuthService` là singleton class nên dùng PascalCase
     - `customerApi` là service object nên dùng camelCase
   - **Cải thiện:** Nên standardize: tất cả services dùng camelCase + suffix `Api` hoặc `Service` (ví dụ: `customerApi.js`, `authService.js`)

---

### Câu hỏi 2: Build tool và Development setup

**Trả lời:**

1. **Lý do chọn Vite:**

   - **Performance:** Vite sử dụng ES modules và native ESM, build và HMR nhanh hơn CRA rất nhiều
   - **Modern tooling:** Hỗ trợ TypeScript, CSS modules, PostCSS out of the box
   - **So với CRA:** CRA đã deprecated, Vite là future của React tooling
   - **So với Next.js:** Next.js là full-stack framework, project này chỉ cần SPA nên Vite phù hợp hơn

2. **Production build optimization:**

   - **Hiện tại:** Vite tự động optimize (minification, tree shaking) trong production build
   - **Cấu hình:** `vite.config.js` đơn giản, chưa có custom optimization
   - **Cải thiện cần thiết:**
     - Thêm code splitting configuration
     - Bundle analysis với `rollup-plugin-visualizer`
     - Chunk size limits

3. **Environment variables:**

   - **Hiện tại:** Sử dụng `import.meta.env.VITE_API_BASE_URL`
   - **Thiếu:** File `.env.example` để document các biến môi trường
   - **Cải thiện:** Tạo `.env.example` với các biến cần thiết:
     ```env
     VITE_API_BASE_URL=http://localhost:5014/api
     ```

4. **CI/CD pipeline:**
   - **Hiện tại:** Chưa có CI/CD pipeline
   - **Cải thiện cần thiết:**
     - Setup GitHub Actions hoặc GitLab CI
     - Lint và build checks trước khi merge
     - Automated testing (khi có tests)
     - Automated deployment

---

## II. STATE MANAGEMENT

### Câu hỏi 3: State Management Strategy

**Trả lời:**

1. **Lý do chọn local state + Context API:**

   - **Phù hợp với quy mô:** Mặc dù có 4 actors, mỗi actor page độc lập, không cần share state phức tạp
   - **Đơn giản:** Context API đủ cho global state nhỏ (Toast notifications)
   - **Performance:** Với ToastProvider, chỉ re-render khi toasts thay đổi (đã optimize với `useMemo`, `useCallback`)
   - **So với Redux:** Redux phức tạp hơn cần thiết, chỉ cần khi có shared state phức tạp giữa nhiều components

2. **Centralize state management:**

   - **Hiện tại:** Mỗi component tự quản lý `loading`, `error` state
   - **Cải thiện:** Có thể tạo custom hook `useAsyncState` để centralize:
     ```javascript
     const useAsyncState = () => {
       const [loading, setLoading] = useState(false);
       const [error, setError] = useState(null);
       // ... common logic
     };
     ```

3. **State synchronization:**

   - **Hiện tại:** Sử dụng callback props (`onReloadOrders`, `onConvertToOrder`)
   - **Ví dụ:** Khi tạo order mới, gọi `onReloadOrders()` để refresh OrderManagement
   - **Cải thiện:** Có thể dùng Context API cho shared state hoặc event emitter pattern

4. **Performance optimization:**
   - **ToastProvider:** Đã optimize với `useMemo` và `useCallback` để tránh re-renders không cần thiết
   - **Context splitting:** Chỉ ToastProvider dùng Context, các state khác là local để tránh performance issues

---

### Câu hỏi 4: Custom Hooks Pattern

**Trả lời:**

1. **Code duplication:**

   - **Thừa nhận:** Có duplication giữa các hooks (`useOrderApi`, `useQuoteApi`, `useContractApi`) - cùng pattern `handleApiCall`, `loading`, `error`
   - **Lý do:** Mỗi hook có business logic riêng, nhưng có thể extract common logic

2. **Base hook:**

   - **Hiện tại:** Chưa có base hook
   - **Cải thiện:** Tạo `useApi` base hook:
     ```javascript
     const useApi = (apiCall) => {
       const [loading, setLoading] = useState(false);
       const [error, setError] = useState(null);
       // ... common logic
     };
     ```

3. **Caching và data invalidation:**

   - **Hiện tại:** Chưa có caching mechanism
   - **Cải thiện:** Có thể implement React Query hoặc SWR cho caching và auto-refetch

4. **Retry logic:**
   - **Hiện tại:** Chưa có retry logic
   - **Cải thiện:** Có thể thêm retry logic vào axios interceptor hoặc custom hook

---

## III. PERFORMANCE OPTIMIZATION

### Câu hỏi 5: React Performance Optimization

**Trả lời:**

1. **Tiêu chí sử dụng useCallback/useMemo:**

   - **useCallback:** Khi function được pass vào child component hoặc dependency của useEffect
   - **useMemo:** Khi tính toán expensive hoặc object/array được pass vào child component
   - **Ví dụ:** `ToastProvider` sử dụng `useCallback` cho các functions để tránh re-render children

2. **React DevTools Profiler:**

   - **Hiện tại:** Chưa có formal performance analysis
   - **Cải thiện:** Nên sử dụng React DevTools Profiler để identify re-render issues

3. **Over-optimization:**

   - **Risk:** Có thể có over-optimization với 205 matches
   - **Giải pháp:** Chỉ optimize khi có performance issue thực tế, không optimize prematurely

4. **Code splitting và lazy loading:**

   - **Hiện tại:** Chưa có code splitting - tất cả pages được import trực tiếp trong `App.jsx`
   - **Cải thiện cần thiết:**
     ```javascript
     const DealerStaffPage = React.lazy(() =>
       import("./pages/DealerStaffPage/DealerStaffPage")
     );
     // Wrap với Suspense
     <Suspense fallback={<Loading />}>
       <DealerStaffPage />
     </Suspense>;
     ```
   - **Lợi ích:** Giảm initial bundle size, load pages on-demand

5. **Bundle size:**
   - **Hiện tại:** Chưa đo bundle size
   - **Cải thiện:** Sử dụng `vite-bundle-visualizer` để analyze bundle size và optimize

---

### Câu hỏi 6: API Call Optimization

**Trả lời:**

1. **Duplicate API calls:**

   - **Vấn đề:** Có thể có duplicate calls khi nhiều components cùng cần data (ví dụ: products list)
   - **Hiện tại:** Mỗi component tự fetch
   - **Cải thiện:** Sử dụng React Query hoặc SWR để deduplicate requests

2. **Request cancellation:**

   - **Hiện tại:** Chưa implement request cancellation
   - **Cải thiện:** Sử dụng AbortController trong axios để cancel requests khi component unmount

3. **Debounce/throttle:**

   - **Hiện tại:** Có debounce trong `QuotationManagement` (500ms), nhưng không consistent
   - **Cải thiện:** Tạo custom hook `useDebounce` để reuse:
     ```javascript
     const useDebounce = (value, delay) => {
       // ... implementation
     };
     ```

4. **Pagination strategy:**
   - **Client-side:** Sử dụng khi data nhỏ (< 100 items) - ví dụ: DebtManagement (Dealer Manager)
   - **Server-side:** Sử dụng khi data lớn - ví dụ: OrderManagement, QuotationManagement
   - **Tiêu chí:** Dựa trên số lượng data và performance requirements

---

## IV. SECURITY

### Câu hỏi 7: Authentication và Authorization

**Trả lời:**

1. **localStorage vs sessionStorage vs httpOnly cookies:**

   - **Lý do chọn localStorage:**
     - Token persist qua browser sessions
     - Dễ implement
   - **Security risk:** Có risk về XSS attacks nếu có malicious scripts
   - **Cải thiện:**
     - Nên sử dụng httpOnly cookies (backend phải support)
     - Hoặc sử dụng sessionStorage nếu không cần persist
     - Implement Content Security Policy (CSP)

2. **Token expiration validation:**

   - **Hiện tại:** Token được decode bằng `atob()`, nhưng chưa validate expiration
   - **Cải thiện:** Thêm validation:
     ```javascript
     const isTokenExpired = (token) => {
       const payload = JSON.parse(atob(token.split(".")[1]));
       return payload.exp * 1000 < Date.now();
     };
     ```

3. **ProtectedRoute token check:**

   - **Hiện tại:** Chỉ check `isAuthenticated()` (check token existence)
   - **Cải thiện:** Thêm token expiration check trong `ProtectedRoute`

4. **Token refresh mechanism:**

   - **Hiện tại:** Chưa có token refresh
   - **Cải thiện:** Implement refresh token flow:
     - Khi token sắp hết hạn, tự động refresh
     - Handle refresh failure (redirect to login)

5. **Rate limiting:**
   - **Hiện tại:** Chưa có rate limiting ở frontend
   - **Lưu ý:** Rate limiting nên implement ở backend, frontend chỉ hiển thị error message

---

### Câu hỏi 8: Data Validation và Sanitization

**Trả lời:**

1. **Validation strategy:**

   - **Hiện tại:** Validation được implement manually trong từng form (ví dụ: `AddCustomerForm`)
   - **Không consistent:** Một số forms có validation, một số chưa có
   - **Cải thiện:** Tạo validation utility hoặc sử dụng library (Yup, Zod)

2. **Validation library:**

   - **Hiện tại:** Chưa sử dụng validation library
   - **Cải thiện:** Nên sử dụng Yup hoặc Zod để:
     - Consistent validation rules
     - Reusable schemas
     - Better error messages

3. **Input sanitization:**

   - **Hiện tại:** Chưa có explicit sanitization
   - **Lưu ý:** React tự động escape HTML, nhưng nên sanitize trước khi gửi lên server
   - **Cải thiện:** Sử dụng `DOMPurify` hoặc sanitize ở backend

4. **Sensitive data logging:**
   - **Hiện tại:** Có một số `console.log` trong code (ví dụ: `QuotationManagement.jsx`)
   - **Cải thiện:**
     - Remove hoặc disable console.log trong production
     - Sử dụng logging service (Sentry, LogRocket) cho production errors
     - Không log sensitive data (tokens, passwords)

---

## V. ERROR HANDLING

### Câu hỏi 9: Error Handling Strategy

**Trả lời:**

1. **Error Boundary:**

   - **Hiện tại:** Chưa có Error Boundary component
   - **Cải thiện cần thiết:** Tạo Error Boundary để catch React errors:
     ```javascript
     class ErrorBoundary extends React.Component {
       // ... implementation
     }
     ```

2. **Error message format:**

   - **Hiện tại:** Error messages được hiển thị qua Toast notifications
   - **Không consistent:** Một số errors có technical messages, một số có user-friendly messages
   - **Cải thiện:** Tạo error message mapping để convert technical errors thành user-friendly messages

3. **Error logging:**

   - **Hiện tại:** Chưa có error logging mechanism
   - **Cải thiện:** Integrate error tracking service (Sentry, LogRocket) để track errors trong production

4. **Retry logic:**

   - **Hiện tại:** Chưa có retry logic
   - **Cải thiện:** Implement retry với exponential backoff cho network errors

5. **Network errors:**
   - **Hiện tại:** Chưa differentiate giữa network errors và server errors
   - **Cải thiện:** Handle offline state và timeout errors riêng biệt

---

### Câu hỏi 10: API Error Handling

**Trả lời:**

1. **Centralized error handling:**

   - **Hiện tại:** Có `handleApiError` trong `utils.js` và axios interceptors
   - **Đã centralized:** Tất cả API errors được handle qua interceptors và `handleApiError`
   - **Cải thiện:** Có thể improve error message mapping

2. **Error type differentiation:**

   - **Hiện tại:** Có handle different status codes (400, 401, 403, 404, 500) trong `handleApiError`
   - **Ví dụ:** 401 redirects to login, 400 shows validation errors

3. **User-friendly error messages:**

   - **Hiện tại:** Một số errors có technical messages
   - **Cải thiện:** Tạo error message mapping:
     ```javascript
     const ERROR_MESSAGES = {
       400: "Dữ liệu không hợp lệ",
       401: "Phiên đăng nhập đã hết hạn",
       500: "Lỗi server, vui lòng thử lại sau",
     };
     ```

4. **401 handling:**
   - **Hiện tại:** Có handle 401 trong axios interceptor (redirect to login)
   - **Edge cases:** Cần handle khi đang ở login page hoặc khi token refresh fails

---

## VI. CODE QUALITY VÀ BEST PRACTICES

### Câu hỏi 11: Code Quality và Maintainability

**Trả lời:**

1. **Code review process:**

   - **Hiện tại:** Chưa có formal code review process (project solo)
   - **Cải thiện:** Nên có code review checklist và guidelines

2. **Coding standards:**

   - **Hiện tại:** Có ESLint config với basic rules
   - **Cải thiện:**
     - Thêm Prettier cho code formatting
     - Stricter ESLint rules
     - Pre-commit hooks với Husky

3. **TypeScript:**

   - **Hiện tại:** Sử dụng JavaScript
   - **Lý do:** Project timeline và learning curve
   - **Cải thiện:** Nên migrate sang TypeScript để:
     - Type safety
     - Better IDE support
     - Catch errors at compile time

4. **Testing:**

   - **Hiện tại:** Chưa có tests
   - **Lý do:** Focus vào features và functionality trước
   - **Cải thiện:** Plan implement tests với:
     - Unit tests: Jest + React Testing Library
     - Integration tests: Test API integration
     - E2E tests: Cypress hoặc Playwright

5. **Documentation:**
   - **Hiện tại:** Có JSDoc comments ở một số hooks và services, nhưng không đầy đủ
   - **Cải thiện:**
     - Document tất cả components, hooks, services
     - Tạo README với setup instructions
     - API documentation

---

### Câu hỏi 12: Component Design Patterns

**Trả lời:**

1. **Single Responsibility Principle:**

   - **Thừa nhận:** Một số components như `QuotationManagement` có nhiều responsibilities (state, API calls, UI)
   - **Lý do:** Để đơn giản hóa và giảm prop drilling
   - **Cải thiện:** Có thể split thành:
     - Container component (logic)
     - Presentational component (UI)

2. **Reusable components:**

   - **Hiện tại:** Có một số reusable components (`CustomDropdown`, `Toast`, `ProtectedRoute`)
   - **Cải thiện:** Có thể tạo thêm:
     - `Button`, `Input`, `Modal`, `Table` components
     - Component library cho consistency

3. **Component composition:**

   - **Hiện tại:** Sử dụng props và callbacks
   - **Cải thiện:** Có thể sử dụng:
     - Render props pattern
     - Compound components pattern
     - Context API cho deep prop drilling

4. **Design patterns:**
   - **Hiện tại:** Chưa sử dụng HOC, Render Props, Compound Components
   - **Cải thiện:** Có thể implement các patterns này khi cần reuse logic hoặc UI patterns

---

## VII. ROUTING VÀ NAVIGATION

### Câu hỏi 13: Routing Strategy

**Trả lời:**

1. **Nested routes:**

   - **Hiện tại:** Chưa sử dụng nested routes
   - **Lý do:** Mỗi actor page có internal routing riêng (state-based, không phải URL-based)
   - **Cải thiện:** Có thể implement nested routes cho better URL structure và deep linking

2. **Route guards:**

   - **Hiện tại:** Có `ProtectedRoute` component để guard routes
   - **Đã implement:** Check authentication và role-based access

3. **Deep linking:**

   - **Hiện tại:** Chưa support deep linking cho sub-pages (ví dụ: `/dealerStaff/quotations/123`)
   - **Cải thiện:** Implement nested routes để support deep linking

4. **404 page:**

   - **Hiện tại:** Có catch-all route redirect về default, nhưng không có 404 page
   - **Cải thiện:** Tạo 404 page thay vì redirect

5. **Breadcrumb navigation:**
   - **Hiện tại:** Chưa có breadcrumb navigation
   - **Cải thiện:** Implement breadcrumb để user biết vị trí hiện tại trong navigation hierarchy

---

## VIII. DEPENDENCIES VÀ VERSION MANAGEMENT

### Câu hỏi 14: Dependency Management

**Trả lời:**

1. **Dependency audit:**

   - **Hiện tại:** Chưa có formal dependency audit
   - **Cải thiện:**
     - Chạy `npm audit` regularly
     - Setup Dependabot hoặc Renovate để auto-update dependencies
     - Review security advisories

2. **React 19.1.1:**

   - **Lý do:** Sử dụng version mới nhất để có latest features và performance improvements
   - **Risk:** Có thể có breaking changes hoặc bugs
   - **Cải thiện:** Nên test thoroughly và có rollback plan

3. **Lock file:**

   - **Hiện tại:** Có `package-lock.json` (nếu dùng npm)
   - **Đảm bảo:** Lock file được commit vào git để đảm bảo consistent dependencies

4. **Unused dependencies:**

   - **Hiện tại:** Chưa audit unused dependencies
   - **Cải thiện:** Sử dụng `depcheck` để detect unused dependencies

5. **Peer dependencies:**
   - **Hiện tại:** React Router v7 compatible với React 19
   - **Cải thiện:** Nên check peer dependencies warnings và resolve conflicts

---

## IX. UI/UX VÀ ACCESSIBILITY

### Câu hỏi 15: UI/UX Consistency

**Trả lời:**

1. **Design system:**

   - **Hiện tại:** Chưa có formal design system
   - **Có consistency:** Sử dụng CSS variables và consistent color palette
   - **Cải thiện:**
     - Tạo design system document
     - Component library với Storybook
     - Design tokens (colors, spacing, typography)

2. **CSS-in-JS:**

   - **Hiện tại:** Sử dụng plain CSS với scoped classes
   - **Lý do:**
     - Đơn giản, không cần thêm dependencies
     - Performance tốt
   - **Cải thiện:** Có thể migrate sang CSS Modules hoặc styled-components nếu cần dynamic styling

3. **Responsive design:**

   - **Hiện tại:** Có media queries ở một số components
   - **Cải thiện:**
     - Test trên real devices
     - Mobile-first approach
     - Breakpoint system

4. **Dark mode:**

   - **Hiện tại:** Chưa có dark mode support
   - **Cải thiện:** Implement dark mode với CSS variables và theme context

5. **Loading states:**
   - **Hiện tại:** Có loading states (spinners) ở một số components
   - **Cải thiện:**
     - Skeleton screens thay vì spinners
     - Progressive loading
     - Optimistic UI updates

---

### Câu hỏi 16: Accessibility

**Trả lời:**

1. **WCAG guidelines:**

   - **Hiện tại:** Chưa follow WCAG guidelines formally
   - **Cải thiện:**
     - Audit với accessibility tools (axe, WAVE)
     - Follow WCAG 2.1 AA standards
     - Keyboard navigation support

2. **ARIA labels:**

   - **Hiện tại:** Chưa có ARIA labels
   - **Cải thiện:** Thêm ARIA labels cho interactive elements

3. **Screen reader support:**

   - **Hiện tại:** Chưa test với screen readers
   - **Cải thiện:** Test với NVDA, JAWS, VoiceOver

4. **Color contrast:**

   - **Hiện tại:** Chưa audit color contrast
   - **Cải thiện:** Đảm bảo contrast ratio đạt WCAG AA (4.5:1)

5. **Focus management:**
   - **Hiện tại:** Chưa có focus management cho modals
   - **Cải thiện:**
     - Focus trap trong modals
     - Focus restoration khi close modal
     - Visible focus indicators

---

## X. TESTING

### Câu hỏi 17: Testing Strategy

**Trả lời:**

1. **Testing strategy:**

   - **Hiện tại:** Chưa có tests
   - **Lý do:**
     - Focus vào features và functionality
     - Timeline constraints
   - **Cải thiện:** Plan implement testing strategy:
     - Unit tests cho utilities và hooks
     - Component tests cho UI components
     - Integration tests cho API calls
     - E2E tests cho critical flows

2. **Testing library:**

   - **Plan:** Sử dụng Vitest (Vite-native) hoặc Jest + React Testing Library
   - **Lý do:** Vitest tích hợp tốt với Vite, faster than Jest

3. **Quality assurance:**

   - **Hiện tại:** Manual testing
   - **Cải thiện:**
     - Automated tests
     - Test coverage goals (80%+)
     - CI/CD integration

4. **Manual testing checklist:**

   - **Hiện tại:** Có manual testing cho các features
   - **Cải thiện:** Tạo formal testing checklist document

5. **E2E tests:**
   - **Plan:** Sử dụng Playwright hoặc Cypress
   - **Focus:** Critical user flows (login, create order, payment)

---

## XI. SCALABILITY VÀ MAINTAINABILITY

### Câu hỏi 18: Scalability

**Trả lời:**

1. **Scaling với nhiều users:**

   - **Frontend:** Stateless, có thể scale bằng CDN và load balancing
   - **Performance bottlenecks:**
     - Bundle size (cần code splitting)
     - API calls (cần caching)
   - **Cải thiện:**
     - CDN cho static assets
     - API caching
     - Lazy loading

2. **Micro-frontends:**

   - **Hiện tại:** Chưa có plan
   - **Khi nào cần:** Khi có nhiều teams hoặc cần independent deployment
   - **Cải thiện:** Có thể migrate sang Module Federation nếu cần

3. **Codebase growth:**

   - **Hiện tại:** Cấu trúc hiện tại có thể scale
   - **Cải thiện:**
     - Feature-based structure khi cần
     - Monorepo nếu có nhiều packages

4. **Code splitting:**

   - **Hiện tại:** Chưa có code splitting
   - **Cải thiện:** Implement route-based và component-based code splitting

5. **Onboarding:**
   - **Hiện tại:** Chưa có onboarding documentation
   - **Cải thiện:**
     - README với setup instructions
     - Architecture documentation
     - Contributing guidelines

---

### Câu hỏi 19: Maintainability

**Trả lời:**

1. **Technical debt:**

   - **Hiện tại:** Có một số technical debt:
     - Thiếu tests
     - Code duplication trong hooks
     - Chưa có Error Boundary
   - **Plan:** Address trong future iterations

2. **Refactoring strategy:**

   - **Hiện tại:** Refactor khi cần (ví dụ: fix bugs, improve performance)
   - **Cải thiện:**
     - Regular refactoring sprints
     - Code review để identify refactoring opportunities

3. **Deprecation strategy:**

   - **Hiện tại:** Chưa có formal deprecation strategy
   - **Cải thiện:**
     - Deprecation warnings
     - Migration guides
     - Timeline cho removal

4. **Migration guides:**

   - **Hiện tại:** Chưa có
   - **Cải thiện:** Tạo migration guides khi có breaking changes

5. **Dependencies updates:**
   - **Hiện tại:** Manual updates
   - **Cải thiện:**
     - Dependabot hoặc Renovate
     - Regular dependency audits
     - Test updates trước khi merge

---

## XII. INTEGRATION VÀ DEPLOYMENT

### Câu hỏi 20: Backend Integration

**Trả lời:**

1. **API contract documentation:**

   - **Hiện tại:** Chưa có formal API documentation
   - **Cải thiện:**
     - OpenAPI/Swagger documentation
     - API contract testing
     - Versioning strategy

2. **API versioning:**

   - **Hiện tại:** Chưa có API versioning
   - **Cải thiện:** Implement API versioning (ví dụ: `/api/v1/`, `/api/v2/`)

3. **Mock data:**

   - **Hiện tại:** Chưa có mock data
   - **Cải thiện:**
     - MSW (Mock Service Worker) cho development
     - Mock API responses cho testing

4. **Integration tests:**

   - **Hiện tại:** Chưa có
   - **Cải thiện:** Integration tests với backend API

5. **Backward compatibility:**
   - **Hiện tại:** Chưa có strategy
   - **Cải thiện:**
     - API versioning
     - Deprecation warnings
     - Migration support

---

### Câu hỏi 21: Deployment

**Trả lời:**

1. **Deployment process:**

   - **Hiện tại:** Manual deployment
   - **Cải thiện:**
     - CI/CD pipeline (GitHub Actions, GitLab CI)
     - Automated builds và tests
     - Automated deployment

2. **Deployment platform:**

   - **Plan:** Vercel, Netlify, hoặc AWS S3 + CloudFront
   - **Lý do:**
     - Easy setup
     - CDN integration
     - Environment variables support

3. **Environment management:**

   - **Hiện tại:** Sử dụng `.env` files
   - **Cải thiện:**
     - Separate environments (dev, staging, production)
     - Environment-specific configurations
     - Secrets management

4. **Rollback strategy:**

   - **Hiện tại:** Chưa có
   - **Cải thiện:**
     - Version tagging
     - Quick rollback mechanism
     - Health checks

5. **Monitoring và analytics:**
   - **Hiện tại:** Chưa có
   - **Cải thiện:**
     - Error tracking (Sentry)
     - Performance monitoring (Web Vitals)
     - Analytics (Google Analytics, Plausible)

---

## KẾT LUẬN

### Tóm tắt câu trả lời:

1. **Điểm mạnh đã đạt được:**

   - Cấu trúc code rõ ràng, dễ maintain
   - Custom hooks pattern tốt
   - Error handling ở nhiều levels
   - Protected routes implementation
   - Context API optimization

2. **Điểm cần cải thiện và plan:**

   - **Ngắn hạn:** Error Boundary, code splitting, testing
   - **Trung hạn:** TypeScript migration, accessibility improvements
   - **Dài hạn:** Micro-frontends (nếu cần), advanced performance optimization

3. **Lessons learned:**
   - Nên implement testing từ đầu
   - Nên có design system và documentation sớm
   - Nên optimize performance sớm (code splitting, lazy loading)

---

**Lưu ý:** Các câu trả lời này dựa trên implementation thực tế của hệ thống. Một số điểm cần cải thiện đã được identify và có plan để address trong tương lai.
