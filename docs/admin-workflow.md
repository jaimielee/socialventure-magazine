# Astro Admin Workflow

이 프로젝트는 WordPress 없이 Astro + MDX + Decap CMS로 관리합니다.

## 로컬에서 편집

터미널 1:

```bash
npm run dev
```

터미널 2:

```bash
npm run admin
```

브라우저:

```text
http://localhost:4321/admin
```

로컬 관리자에서 작성한 글은 `src/content` 안의 MD/MDX 파일로 저장됩니다.

## 배포 후 편집

`public/admin/config.yml`은 GitHub 저장소를 기준으로 설정되어 있습니다.

```yaml
backend:
  name: github
  repo: jaimielee/socialventure-magazine
  branch: main
```

배포 후 `/admin`에서 글을 작성하면 GitHub에 커밋되고, Cloudflare Workers Builds가 다시 빌드합니다.

현재 배포 대상은 `socialventure-magazine` Worker입니다. 빌드 명령은 `npm run build`, 배포 명령은 `npx wrangler deploy`입니다. 저장소 루트의 `wrangler.jsonc`가 Astro의 정적 빌드 결과인 `dist`를 배포 대상으로 지정합니다. 이 설정이 없으면 Wrangler가 Astro 자동 설정을 시도하므로 파일을 유지합니다.
Cloudflare Pages에서 Decap CMS 로그인을 사용하려면 GitHub OAuth 브릿지 설정이 추가로 필요합니다.

## 글 상태

- `draft`: 작성 중
- `review`: 검토 중
- `published`: 공개

관리자 화면에서 공개 상태를 선택할 수 있습니다. 배포 사이트는 `published` 상태인 글만 목록, 검색, 상세 페이지에 노출합니다. `draft`와 `review`는 로컬 개발 서버에서 확인합니다.

로컬 검토 주소 예시:

```text
http://localhost:4321/articles/글-slug/
```

글을 공개하려면 관리자 화면에서 상태를 `published`로 바꾸고 저장합니다. 글을 삭제하려면 관리자 화면에서 해당 항목을 열고 삭제합니다. 삭제와 공개 변경은 GitHub 커밋으로 반영되고, 배포 후 실제 사이트에서 확인합니다.

## 방문자 분석

Google Analytics 4는 `PUBLIC_GA_MEASUREMENT_ID` 환경변수가 있을 때만 활성화됩니다.

로컬에서 확인할 때는 `.env`에 다음 값을 넣습니다.

```text
PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

운영 배포에서는 Cloudflare 빌드 환경변수에 같은 이름으로 GA4 측정 ID를 등록합니다. Astro 정적 빌드에서 HTML에 삽입되는 값이므로, 환경변수 변경 뒤에는 새 빌드와 배포가 필요합니다.
