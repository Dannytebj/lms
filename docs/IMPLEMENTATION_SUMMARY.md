# Course Assignment & Enrollment Implementation

## Overview
This implementation adds course assignment and enrollment functionality to the LMS, allowing admins to assign courses to users, and users to enroll in assigned courses.

## Schema Changes

### New Model: `CourseAssignment`
```prisma
model CourseAssignment {
  id        String   @id @default(cuid())
  userId    String
  courseId  String
  assignedBy String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  course    Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  
  @@unique([userId, courseId])
}
```

### Updated Models
- **User**: Added `assignedCourses CourseAssignment[]` relationship
- **Course**: Added `assignments CourseAssignment[]` relationship
- **Enrollment**: Added `onDelete: Cascade` and unique constraint on `[userId, courseId]`

## Server Actions

### Admin Course Assignment Actions

#### `assignCourseToUser(courseId: string, userId: string)`
Assigns a single course to a user.
- ✅ Verifies admin role
- ✅ Checks course and user existence
- ✅ Prevents duplicate assignments
- ✅ Records who made the assignment

#### `assignCourseToMultipleUsers(courseId: string, userIds: string[])`
Bulk assigns a course to multiple users.
- ✅ Verifies admin role
- ✅ Validates all users exist
- ✅ Skips already-assigned courses
- ✅ Returns count of successful assignments

#### `removeAssignment(courseId: string, userId: string)`
Removes a course assignment from a user.
- ✅ Verifies admin role
- ✅ Deletes the assignment record

### User Enrollment Actions

#### `getAvailableCoursesForUser()`
Fetches courses assigned to the current user that they haven't enrolled in yet.
- 📊 Returns course count (modules, enrollments)
- 📋 Ordered by most recent first
- 🔒 User can only see their own assigned courses

#### `enrollInCourse(courseId: string)`
Enrolls the user in an assigned course.
- ✅ Verifies course exists
- ✅ Checks course is assigned to user
- ✅ Prevents duplicate enrollments
- ✅ Returns enrollment with course details

#### `getEnrolledCourses()`
Fetches all courses the user is enrolled in.
- 📋 Includes course modules
- 📊 Includes enrollment count
- 🔒 User can only see their own enrollments
- 📅 Ordered by most recent first

## Data Flow

```
1. Admin Dashboard
   ↓
2. Admin selects course & users
   ↓
3. assignCourseToUser() / assignCourseToMultipleUsers()
   → Creates CourseAssignment records
   ↓
4. User logs in
   ↓
5. getAvailableCoursesForUser()
   → Shows assigned courses not enrolled in
   ↓
6. User clicks "Enroll"
   ↓
7. enrollInCourse()
   → Creates Enrollment record
   ↓
8. User dashboard shows enrolled course
   ↓
9. getEnrolledCourses()
   → Shows all enrolled courses with modules
```

## Security Features

- ✅ Role-based access control (only ADMIN/SUPER_ADMIN can assign)
- ✅ Session verification on all actions
- ✅ Users can only enroll in assigned courses
- ✅ Prevents duplicate assignments and enrollments
- ✅ Unique constraints on database level

## Error Handling

All actions include comprehensive error handling:
- Invalid courses/users
- Unauthorized access attempts
- Duplicate operations
- Database errors

## Database Migration

Created migration: `20251205235727_add_course_assignment`
- ✅ Creates `CourseAssignment` table
- ✅ Adds foreign key relationships
- ✅ Adds unique constraints
- ✅ Enables cascade deletes

## Next Steps

1. Create UI components for:
   - Admin course assignment interface
   - Available courses display for users
   - Enrollment buttons
   
2. Update dashboard pages to use the new actions

3. Add course status indicators (assigned, enrolled, completed)
