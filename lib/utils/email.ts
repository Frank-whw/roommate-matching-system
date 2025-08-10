/**
 * 根据学号生成邮箱地址
 * @param studentId 学号
 * @returns 生成的邮箱地址
 */
export function generateEmailFromStudentId(studentId: string): string {
  return `${studentId}@stu.ecnu.edu.cn`;
}