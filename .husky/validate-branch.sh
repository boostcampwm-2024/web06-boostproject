#!/usr/bin/env bash

branch="$(git rev-parse --abbrev-ref HEAD)"

IFS='/' read -ra PARTS <<< "$branch"

if [ ${#PARTS[@]} -ne 2 ]; then
    echo "\n오류: 브랜치 이름 '$branch'이(가) 올바른 형식이 아닙니다."
    echo "브랜치 이름은 다음 패턴을 따라야 합니다: <타입>/#<이슈번호>"
    echo "예시: feat/#123\n"
    exit 1
fi

type="${PARTS[0]}"
issue="${PARTS[1]}"

valid_types=("feat" "fix" "refactor")
if [[ ! " ${valid_types[@]} " =~ " ${type} " ]]; then
    echo "\n오류: 유효하지 않은 브랜치 타입 '$type'"
    echo "유효한 타입: ${valid_types[*]}\n"
    exit 1
fi

if [[ ! $issue =~ ^#[0-9]+$ ]]; then
    echo "\n오류: 유효하지 않은 이슈 번호 '$issue'"
    echo "이슈 번호는 #으로 시작하고 그 뒤에 숫자가 와야 합니다\n"
    exit 1
fi

echo "\n브랜치 이름이 유효합니다: $branch\n"
exit 0