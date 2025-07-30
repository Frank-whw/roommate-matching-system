# 室友匹配系统 API 文档

## 概述

本系统提供完整的 RESTful API 接口，支持用户认证、个人资料管理、匹配系统和队伍管理等功能。

## 认证方式

- 使用 JWT Token 进行认证
- Token 通过 Cookie (`session`) 传递
- 所有需要认证的接口在未登录时返回 401 状态码

## 统一响应格式

### 成功响应
```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    // 具体数据
  }
}
```

### 错误响应
```json
{
  "error": "错误信息",
  "success": false
}
```

## 接口列表

### 🔐 认证相关接口

#### POST /api/auth/register
用户注册

**请求参数:**
```json
{
  "name": "张三",
  "email": "zhangsan@university.edu.cn",
  "studentId": "10215501401",
  "password": "123456"
}
```

**响应:**
```json
{
  "success": true,
  "message": "注册成功！请查收验证邮件并在10分钟内完成验证。",
  "data": {
    "user": {
      "id": 1,
      "name": "张三",
      "email": "zhangsan@university.edu.cn",
      "studentId": "10215501401",
      "isEmailVerified": false
    },
    "emailSent": true,
    "verificationRequired": true
  }
}
```

#### POST /api/auth/login
用户登录

**请求参数:**
```json
{
  "studentId": "10215501401",
  "password": "123456"
}
```

**响应:**
```json
{
  "success": true,
  "message": "登录成功！",
  "data": {
    "user": {
      "id": 1,
      "name": "张三",
      "email": "zhangsan@university.edu.cn",
      "studentId": "10215501401",
      "isEmailVerified": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### POST /api/auth/logout
用户退出登录

**响应:**
```json
{
  "success": true,
  "message": "已成功退出登录"
}
```

#### POST /api/auth/verify-email
邮箱验证

**请求参数:**
```json
{
  "token": "verification_token_here"
}
```

**响应:**
```json
{
  "success": true,
  "message": "邮箱验证成功！您现在可以登录了。",
  "data": {
    "user": {
      "id": 1,
      "name": "张三",
      "email": "zhangsan@university.edu.cn",
      "studentId": "10215501401",
      "isEmailVerified": true
    }
  }
}
```

### 👤 用户管理接口

#### GET /api/user
获取当前登录用户信息

**响应:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "张三",
    "email": "zhangsan@university.edu.cn",
    "studentId": "10215501401",
    "isEmailVerified": true
  }
}
```

#### GET /api/users?limit=20&gender=male&mbti=INTJ
获取用户列表（用于匹配）

**查询参数:**
- `limit`: 限制返回数量，默认20
- `gender`: 性别筛选 (male/female/other)
- `mbti`: MBTI类型筛选
- `studyHabit`: 学习习惯筛选 (early_bird/night_owl/flexible)

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "name": "李四",
      "profile": {
        "gender": "male",
        "age": 20,
        "major": "计算机科学",
        "mbti": "INTJ",
        "bio": "热爱编程的大二学生"
      }
    }
  ],
  "pagination": {
    "limit": 20,
    "count": 15
  }
}
```

#### GET /api/users/[id]
获取特定用户信息

**响应:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "李四",
    "email": "li***@university.edu.cn",
    "studentId": "102***01",
    "profile": {
      "gender": "male",
      "age": 20,
      "major": "计算机科学",
      "mbti": "INTJ",
      "bio": "热爱编程的大二学生"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "isEmailVerified": true
  }
}
```

### 📝 个人资料接口

#### GET /api/profile
获取当前用户完整个人资料

**响应:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "张三",
      "email": "zhangsan@university.edu.cn"
    },
    "profile": {
      "wechatId": "zhangsan123",
      "gender": "male",
      "age": 20,
      "major": "计算机科学",
      "grade": "大二",
      "sleepTime": "23:00",
      "wakeTime": "07:00",
      "studyHabit": "early_bird",
      "lifestyle": "balanced",
      "cleanliness": "clean",
      "mbti": "INTJ",
      "roommateExpectations": "希望室友作息规律，爱干净",
      "hobbies": "编程、阅读、运动",
      "bio": "热爱技术的大二学生",
      "isProfileComplete": true
    }
  }
}
```

#### PUT /api/profile
更新个人资料

**请求参数:**
```json
{
  "wechatId": "zhangsan123",
  "gender": "male",
  "age": 20,
  "major": "计算机科学",
  "grade": "大二",
  "sleepTime": "23:00",
  "wakeTime": "07:00",
  "studyHabit": "early_bird",
  "lifestyle": "balanced",
  "cleanliness": "clean",
  "mbti": "INTJ",
  "roommateExpectations": "希望室友作息规律，爱干净",
  "hobbies": "编程、阅读、运动",
  "bio": "热爱技术的大二学生"
}
```

**响应:**
```json
{
  "success": true,
  "message": "个人资料已成功更新！",
  "data": {
    "profile": {
      // 更新后的资料
    },
    "completionPercentage": 85
  }
}
```

### 💖 匹配相关接口

#### GET /api/matches
获取当前用户的匹配列表

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "matchedUser": {
        "id": 2,
        "name": "李四",
        "profile": {
          "gender": "male",
          "age": 20,
          "major": "计算机科学",
          "bio": "热爱编程的大二学生"
        }
      },
      "matchedAt": "2024-01-01T12:00:00.000Z",
      "status": "matched"
    }
  ]
}
```

#### POST /api/matches
点赞用户（创建匹配）

**请求参数:**
```json
{
  "targetUserId": 2
}
```

**响应:**
```json
{
  "success": true,
  "message": "点赞成功！等待对方回应。",
  "data": {
    "isMatch": false,
    "like": {
      "id": 1,
      "targetUserId": 2,
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

#### DELETE /api/matches/[id]
取消匹配

**响应:**
```json
{
  "success": true,
  "message": "已取消匹配"
}
```

### 👥 队伍管理接口

#### GET /api/teams?type=available&limit=20
获取队伍列表

**查询参数:**
- `type`: 队伍类型 (available/my)，默认available
- `limit`: 限制返回数量，默认20

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "编程学习小组",
      "description": "一起学习编程技术",
      "maxMembers": 4,
      "currentMembers": 2,
      "isPrivate": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "leader": {
        "id": 1,
        "name": "张三"
      },
      "members": [
        {
          "id": 1,
          "name": "张三",
          "isLeader": true
        },
        {
          "id": 2,
          "name": "李四",
          "isLeader": false
        }
      ]
    }
  ],
  "pagination": {
    "limit": 20,
    "count": 10
  }
}
```

#### POST /api/teams
创建队伍

**请求参数:**
```json
{
  "name": "编程学习小组",
  "description": "一起学习编程技术",
  "maxMembers": 4,
  "isPrivate": false,
  "tags": "编程,学习"
}
```

**响应:**
```json
{
  "success": true,
  "message": "队伍创建成功！",
  "data": {
    "team": {
      "id": 1,
      "name": "编程学习小组",
      "description": "一起学习编程技术",
      "maxMembers": 4,
      "isPrivate": false
    },
    "member": {
      "id": 1,
      "userId": 1,
      "teamId": 1,
      "isLeader": true
    }
  }
}
```

#### GET /api/teams/[id]
获取特定队伍信息

**响应:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "编程学习小组",
    "description": "一起学习编程技术",
    "maxMembers": 4,
    "currentMembers": 2,
    "isPrivate": false,
    "members": [
      {
        "id": 1,
        "name": "张三",
        "isLeader": true,
        "joinedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### PUT /api/teams/[id]
更新队伍信息（仅队长）

**请求参数:**
```json
{
  "name": "新队伍名称",
  "description": "新描述",
  "maxMembers": 4,
  "isPrivate": false
}
```

#### DELETE /api/teams/[id]
解散队伍（仅队长）

**响应:**
```json
{
  "success": true,
  "message": "队伍已成功解散"
}
```

#### POST /api/teams/[id]/join
申请加入队伍

**请求参数:**
```json
{
  "message": "申请理由"
}
```

**响应:**
```json
{
  "success": true,
  "message": "加入申请已发送，等待队长审核",
  "data": {
    "joinRequest": {
      "id": 1,
      "userId": 2,
      "teamId": 1,
      "status": "pending",
      "message": "申请理由"
    }
  }
}
```

#### DELETE /api/teams/[id]/join
退出队伍

**响应:**
```json
{
  "success": true,
  "message": "已成功退出队伍"
}
```

#### POST /api/teams/[id]/members
队员管理（仅队长）

**请求参数:**
```json
{
  "action": "remove", // 或 "transfer_leadership"
  "targetUserId": 2
}
```

**响应:**
```json
{
  "success": true,
  "message": "成员已被移除",
  "data": {
    // 相关数据
  }
}
```

#### GET /api/teams/requests
获取待审核的加入申请（仅队长）

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 2,
      "teamId": 1,
      "status": "pending",
      "message": "申请理由",
      "createdAt": "2024-01-01T12:00:00.000Z",
      "user": {
        "id": 2,
        "name": "李四"
      },
      "team": {
        "id": 1,
        "name": "编程学习小组"
      }
    }
  ]
}
```

#### POST /api/teams/requests
审核加入申请（仅队长）

**请求参数:**
```json
{
  "requestId": 1,
  "action": "approve", // 或 "reject"
  "rejectReason": "可选的拒绝理由"
}
```

**响应:**
```json
{
  "success": true,
  "message": "申请已通过",
  "data": {
    "request": {
      "id": 1,
      "status": "matched"
    },
    "member": {
      "id": 2,
      "userId": 2,
      "teamId": 1,
      "isLeader": false
    }
  }
}
```

### 🔔 实时通知接口

#### GET /api/realtime/check-updates?since=2024-01-01T12:00:00.000Z
检查实时更新

**查询参数:**
- `since`: ISO格式的时间戳，获取该时间之后的更新

**响应:**
```json
{
  "success": true,
  "data": {
    "newMatches": [
      {
        "id": 1,
        "matchedUser": {
          "id": 2,
          "name": "李四"
        },
        "createdAt": "2024-01-01T12:00:00.000Z"
      }
    ],
    "teamNotifications": [
      {
        "type": "team_join_request",
        "title": "🔔 新的入队申请",
        "message": "李四 申请加入您的队伍 \"编程学习小组\"",
        "data": {
          "requestId": 1,
          "teamId": 1,
          "applicantId": 2,
          "applicantName": "李四"
        }
      }
    ],
    "newLikes": [
      {
        "id": 1,
        "liker": {
          "id": 3,
          "name": "王五"
        },
        "createdAt": "2024-01-01T12:00:00.000Z"
      }
    ]
  }
}
```

## 错误代码说明

- `400`: 请求参数错误
- `401`: 未认证
- `403`: 权限不足
- `404`: 资源不存在
- `409`: 资源冲突（如重复注册）
- `500`: 服务器内部错误

## 使用示例

```javascript
// 登录示例
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    studentId: '10215501401',
    password: '123456'
  })
});

const data = await response.json();
if (data.success) {
  console.log('登录成功', data.data.user);
} else {
  console.error('登录失败', data.error);
}

// 获取用户列表示例
const usersResponse = await fetch('/api/users?limit=10&gender=male');
const usersData = await usersResponse.json();
console.log('用户列表', usersData.data);

// 创建队伍示例
const teamResponse = await fetch('/api/teams', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: '编程学习小组',
    description: '一起学习编程技术',
    maxMembers: 4,
    isPrivate: false
  })
});
```