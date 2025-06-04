#ifndef SystemTypeDefs_h
#define SystemTypeDefs_h

// 기본 타입을 직접 정의 (stdint.h 사용하지 않고)
#ifdef __LP64__
    // 64비트 환경
    typedef long long int64_t;
    typedef int int32_t;
    typedef short int16_t;
    typedef signed char int8_t;
    
    typedef unsigned long long uint64_t;
    typedef unsigned int uint32_t;
    typedef unsigned short uint16_t;
    typedef unsigned char uint8_t;
    
    // u_int 형식의 타입
    typedef unsigned long long u_int64_t;
    typedef unsigned int u_int32_t;
    typedef unsigned short u_int16_t;
    typedef unsigned char u_int8_t;
    
    // 추가 타입
    typedef unsigned long uintptr_t;
#else
    // 32비트 환경
    typedef long long int64_t;
    typedef int int32_t;
    typedef short int16_t;
    typedef signed char int8_t;
    
    typedef unsigned long long uint64_t;
    typedef unsigned int uint32_t;
    typedef unsigned short uint16_t;
    typedef unsigned char uint8_t;
    
    // u_int 형식의 타입
    typedef unsigned long long u_int64_t;
    typedef unsigned int u_int32_t;
    typedef unsigned short u_int16_t;
    typedef unsigned char u_int8_t;
    
    // 추가 타입
    typedef unsigned int uintptr_t;
#endif

// Darwin 관련 타입 정의
typedef int64_t __int64_t;
typedef int32_t __int32_t;
typedef uint64_t __uint64_t;
typedef uint32_t __uint32_t;
typedef uint16_t __uint16_t;
typedef int8_t __int8_t;
typedef uint8_t __uint8_t;
typedef unsigned int __darwin_natural_t;

// 추가 Darwin 타입
typedef unsigned int __darwin_clock_t;
typedef unsigned long __darwin_size_t;
typedef long __darwin_ssize_t;
typedef long __darwin_time_t;
typedef long __darwin_blksize_t;

// 구조체 정의
typedef struct {
    int dummy; // 데이터를 갖기 위한 더미 값
} _STRUCT_MCONTEXT;

#endif /* SystemTypeDefs_h */
