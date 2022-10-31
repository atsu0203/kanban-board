import React from 'react'
import styled from 'styled-components'
import * as color from './color'
import { CardFilter } from './CardFilter'

export function Header({
  filterValue,
  onFilterChange,
  className,
}: {
  filterValue?: string
  onFilterChange?(value: string): void
  className?: string
}) {
  return (
    <Rapper>
      <Container className={className}>
        <Logo>開発プロジェクトボード</Logo>

        <CardFilter value={filterValue} onChange={onFilterChange} />
      </Container>
    </Rapper>
  )
}

const Rapper = styled.div`
  background-color: ${color.Navy};
`

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 50px;
  width: 700px;
  margin-right: auto;
  margin-left: auto;
  background-color: ${color.Navy};
`

const Logo = styled.div`
  color: ${color.White};
  font-size: 20px;
  font-weight: bold;
`
