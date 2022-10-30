import React, { useState } from 'react'
import styled from 'styled-components'
import { Header as _Header } from './Header'
import { Column } from './Column'

export function App() {
  const [filterValue, setFilterValue] = useState('')

  return (
    <Container>
      <Header filterValue={filterValue} onFilterChange={setFilterValue} />

      <MainArea>
        <HorizontalScroll>
          <Column
            title="未対応"
            text=""
            cards={[
              { id: 'a', text: '👍いいね機能' },
              { id: 'b', text: '🖥️バッチ処理' },
              { id: 'c', text: '🗑️削除機能' },
            ]}
          />
          <Column
            title="処理中"
            text=""
            cards={[
              { id: 'e', text: '🧑🏻詳細表示' },
            ]}
          />
          <Column
            title="処理済み"
            filterValue={filterValue}
            cards={[
              { id: 'f', text: '🌍一覧表示' },
              { id: 'g', text: '🔑ログイン機能' }
            ]}
          />
        </HorizontalScroll>
      </MainArea>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-flow: column;
  height: 100%;
  margin:0;
  html,body{margin:0;padding:0;}
`

const Header = styled(_Header)`
  flex-shrink: 0;
`

const MainArea = styled.div`
  height: 100%;
  padding: 16px 0;
  overflow-y: auto;
`

const HorizontalScroll = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  overflow-x: auto;
  justify-content: center;

  > * {
    margin-left: 16px;
    flex-shrink: 0;
  }

  ::after {
    display: block;
    flex: 0 0 16px;
    content: '';
  }
`


export default App;
