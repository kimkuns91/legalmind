import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function MyPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/mypage');
  }

  return (
    <div className="container mx-auto bg-white px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">마이페이지</h1>

      {/* 프로필 섹션 */}
      <Card className="mb-8 border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">프로필 정보</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 overflow-hidden rounded-full bg-gray-100">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt="프로필 이미지"
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-blue-50 text-2xl font-bold text-blue-600">
                  {session.user.name?.[0] || session.user.email?.[0]}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {session.user.name || '이름 없음'}
              </h3>
              <p className="text-gray-500">{session.user.email}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* 나의 활동 섹션 */}
      <Card className="mb-8 border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">나의 활동</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-4">
            <span className="text-2xl font-bold text-gray-900">0</span>
            <span className="text-gray-500">법률 상담</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-4">
            <span className="text-2xl font-bold text-gray-900">0</span>
            <span className="text-gray-500">문서 작성</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-4">
            <span className="text-2xl font-bold text-gray-900">0</span>
            <span className="text-gray-500">저장된 문서</span>
          </div>
        </div>
      </Card>

      {/* 계정 설정 섹션 */}
      <Card className="border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">계정 설정</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">프로필 수정</h3>
              <p className="text-sm text-gray-500">이름, 프로필 이미지 등을 변경합니다</p>
            </div>
            <Button
              variant="outline"
              asChild
              className="border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              <Link href="/mypage/edit-profile">수정</Link>
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">비밀번호 변경</h3>
              <p className="text-sm text-gray-500">계정 보안을 위해 비밀번호를 변경합니다</p>
            </div>
            <Button
              variant="outline"
              asChild
              className="border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              <Link href="/mypage/change-password">변경</Link>
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">알림 설정</h3>
              <p className="text-sm text-gray-500">이메일, 푸시 알림 등을 설정합니다</p>
            </div>
            <Button
              variant="outline"
              asChild
              className="border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              <Link href="/mypage/notifications">설정</Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
