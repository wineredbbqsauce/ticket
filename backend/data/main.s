; main.s - Simple Hello World in x86-64 assembly for Windows

section .data
    msg db "Hello World!", 0

section .text
    extern printf
    global main

main:
    lea rdi, [rel msg]      ; Load address of msg
    call printf             ; Call printf
    xor eax, eax            ; Return 0
    ret


; INSTALL NASM IF NOT NOT INSTALLED
; nasm -f win64 main.s -o main.obj
; link main.objb /SUBSYSTEM: CONSOLE /OUT:main.exe
; ./main.exe


; Eller med MinGW/GCC
; gcc -c hello.s -o hello.o
; gcc hello.o -o hello.exe
; ./hello.exe



; FOR LINUX 

; section .data
;     msg db "Hello World!", 0x0A
;     len equ $ - msg

; section .text
;     global _start

; _start:
;     mov rax, 1              ; write syscall
;     mov rdi, 1              ; stdout
;     mov rsi, msg
;     mov rdx, len
;     syscall
;     
;     mov rax, 60             ; exit syscall
;     xor rdi, rdi
;     syscall