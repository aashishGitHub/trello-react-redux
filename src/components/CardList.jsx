import React from 'react';
import PropTypes from 'prop-types';
import { Droppable } from 'react-beautiful-dnd';
import Card from './Card';
import { CardListContainer, CardListWrapper } from '../styles/CardList.styles';
import CardListHeader from './CardListHeader';
import AddForm from './AddForm';

const CardList = props => {
  return (
    <CardListWrapper>
      <CardListHeader
        listName={props.list.name}
        onChangeListName={props.onChangeListName}
        onRemoveList={props.onRemoveList}
      />
      <Droppable droppableId={props.droppableId}>
        {(provided, snapshot) => (
          <CardListContainer
            ref={provided.innerRef}
            isDraggingOver={snapshot.isDraggingOver}
          >
            {props.list.cards.map((card, index) => (
              <Card
                key={card.id}
                card={card}
                index={index}
                onChangeCardContent={content => props.onChangeCardContent(index, content)}
                onRemoveCard={() => props.onRemoveCard(index)}
              />
            ))}
            {provided.placeholder}
            <AddForm
              onConfirm={props.onAddCard}
              placeholder="+ Add new card"
              focusPlaceholder="Enter card content"
              darkFont
              width="auto"
              gray
            />
          </CardListContainer>
        )}
      </Droppable>
    </CardListWrapper>
  );
};

CardList.propTypes = {
  list: PropTypes.object,
  onChangeCardContent: PropTypes.func,
  onChangeListName: PropTypes.func,
  onRemoveList: PropTypes.func,
  droppableId: PropTypes.string,
  onAddCard: PropTypes.func,
  onRemoveCard: PropTypes.func,
};
export default CardList;
