'use client'

import { useState } from 'react'
import { useTheme, ThemeVariant, ColorMode } from '@/contexts/theme-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Palette, Sun, Moon, Check, Users, Plus } from 'lucide-react'
import type { Group } from '@/types/group'
import { GroupManageDialog } from './group-manage-dialog'

const themeOptions: { value: ThemeVariant; label: string; description: string }[] = [
  {
    value: 'minimal-luxury',
    label: 'Minimal Luxury',
    description: 'Linear, Vercel 스타일의 미니멀 + 고급',
  },
  {
    value: 'modern-finance',
    label: 'Modern Finance',
    description: 'Stripe, Revolut 스타일의 세련된 그라데이션',
  },
  {
    value: 'warm-premium',
    label: 'Warm & Premium',
    description: 'Notion, Clay 스타일의 따뜻한 톤',
  },
  {
    value: 'financial-premium',
    label: 'Financial Premium',
    description: 'Bloomberg, Trading View 스타일',
  },
]

type SettingsPageClientProps = {
  userGroups: Group[]
  currentGroupId: string
}

export function SettingsPageClient({ userGroups, currentGroupId }: SettingsPageClientProps) {
  const { themeVariant, colorMode, setThemeVariant, setColorMode } = useTheme()
  const [groupDialogOpen, setGroupDialogOpen] = useState(false)

  const currentGroup = userGroups.find(g => g.id === currentGroupId)

  return (
    <div className="min-h-screen theme-gradient-bg">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            앱의 테마와 모양을 커스터마이징하세요
          </p>
        </div>

        <div className="space-y-6">
          {/* Group Management */}
          <Card className="border-border/40 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg">그룹 관리</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    그룹을 생성하고 관리하세요
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">현재 그룹</p>
                    <p className="text-xs text-muted-foreground">
                      {currentGroup?.name || '그룹 없음'}
                      {currentGroup?.is_sample && ' (샘플)'}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => setGroupDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    그룹 추가
                  </Button>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    내 그룹: {userGroups.filter(g => !g.is_sample).length}개
                  </p>
                  <p className="text-xs text-muted-foreground">
                    그룹 전환은 상단 네비게이션 바에서 가능합니다
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Color Mode */}
          <Card className="border-border/40 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  {colorMode === 'light' ? (
                    <Sun className="h-4 w-4 text-primary" />
                  ) : (
                    <Moon className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg">컬러 모드</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    라이트 모드 또는 다크 모드를 선택하세요
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button
                  variant={colorMode === 'light' ? 'default' : 'outline'}
                  onClick={() => setColorMode('light')}
                  className="flex-1"
                >
                  <Sun className="mr-2 h-4 w-4" />
                  라이트
                  {colorMode === 'light' && <Check className="ml-auto h-4 w-4" />}
                </Button>
                <Button
                  variant={colorMode === 'dark' ? 'default' : 'outline'}
                  onClick={() => setColorMode('dark')}
                  className="flex-1"
                >
                  <Moon className="mr-2 h-4 w-4" />
                  다크
                  {colorMode === 'dark' && <Check className="ml-auto h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Theme Variant */}
          <Card className="border-border/40 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Palette className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg">테마 스타일</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    원하는 디자인 스타일을 선택하세요
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup value={themeVariant} onValueChange={(value) => setThemeVariant(value as ThemeVariant)}>
                <div className="space-y-3">
                  {themeOptions.map((option) => (
                    <div key={option.value} className="flex items-start space-x-3">
                      <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                      <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium leading-none">{option.label}</p>
                            {themeVariant === option.value && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground sm:text-sm">
                            {option.description}
                          </p>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="border-border/40 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">미리보기</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                현재 선택된 테마: <span className="font-semibold">{themeOptions.find(o => o.value === themeVariant)?.label}</span> ({colorMode === 'light' ? '라이트' : '다크'})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500"></div>
                  <div className="h-8 w-8 rounded-lg bg-rose-500"></div>
                  <div className="h-8 w-8 rounded-lg bg-blue-500"></div>
                  <div className="h-8 w-8 rounded-lg bg-violet-500"></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  페이지를 새로고침하거나 다른 페이지로 이동하면 테마가 적용됩니다
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Group Manage Dialog */}
      <GroupManageDialog
        open={groupDialogOpen}
        onOpenChange={setGroupDialogOpen}
      />
    </div>
  )
}
