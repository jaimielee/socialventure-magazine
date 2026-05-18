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

현재 로컬 편집을 바로 쓰기 위해 `public/admin/config.yml`은 `test-repo` 백엔드로 설정되어 있습니다.

배포 전에 GitHub 저장소 정보를 실제 저장소로 바꿔야 합니다.

```yaml
backend:
  name: github
  repo: YOUR_GITHUB_ID/YOUR_REPO
  branch: main
```

배포 후 `/admin`에서 글을 작성하면 GitHub에 커밋되고, Vercel 또는 Netlify가 다시 빌드합니다.

## 글 상태

- `draft`: 작성 중
- `review`: 검토 중
- `published`: 공개

현재 사이트는 상태값을 표시하지만, 필요하면 나중에 `published`만 공개 화면에 보이도록 필터링할 수 있습니다.
