import React from "react";
import PropTypes from "prop-types";
import urlPropType from "url-prop-type";
import Skeleton from "../../components/atoms/skeleton/skeleton";
import Button from "../../components/atoms/button/button";
import UnorderedList from "../../components/atoms/list/list";
import Alert from "../../components/alert/alert";
import createPath from "../../core/createPath";

function getList(length) {
  return Array.from(new Array(length));
}

function SkeletonElement(_, index) {
  return (
    <li key={index} className="ddb-list-item">
      <section className="ddb-list-item__inner">
        <article className="ddb-list-item__content">
          <figure className="ddb-list-item__cover">
            <Skeleton br="0px" mb="0px" mt="0px" height="154px" width="100px" />
          </figure>
          <div className="ddb-list-item__data">
            <Skeleton width="45px" mb="12px" />
            <Skeleton width="145px" mb="12px" />
            <Skeleton width="95px" />
          </div>
        </article>
        <aside className="ddb-list-item__buttons">
          <Skeleton
            width="151px"
            height="50px"
            className="ddb-btn ddb-list-item__button--remove"
          />
        </aside>
      </section>
    </li>
  );
}

function Checklist({
  loading,
  items,
  onRemove,
  materialUrl,
  authorUrl,
  removeButtonText,
  emptyListText,
  errorText
}) {
  if (loading === "failed") {
    return <Alert type="assertive" variant="warning" message={errorText} />;
  }

  if (loading === "active") {
    return (
      <UnorderedList className="ddb-skeleton-wrapper">
        {getList(4).map(SkeletonElement)}
      </UnorderedList>
    );
  }

  if (loading === "finished" && items.length === 0) {
    return <Alert type="polite" message={emptyListText} />;
  }

  return (
    <UnorderedList>
      {items.map(item => (
        <li key={item.pid} className="ddb-list-item">
          <section className="ddb-list-item__inner">
            <article className="ddb-list-item__content">
              {item.coverUrl && (
                <figure className="ddb-list-item__cover">
                  <a
                    href={createPath({
                      url: materialUrl,
                      property: ":pid",
                      value: item.pid
                    })}
                  >
                    <img src={item.coverUrl} alt={item.title} />
                  </a>
                </figure>
              )}
              <div className="ddb-list-item__data">
                {item.type && (
                  <span className="ddb-list-item__type">{item.type}</span>
                )}
                {item.title && (
                  <a
                    href={createPath({
                      url: materialUrl,
                      property: ":pid",
                      value: item.pid
                    })}
                  >
                    <h2 className="ddb-list-item__title">{item.title}</h2>
                  </a>
                )}
                <p>
                  {item.creators.map((creator, index) => {
                    return (
                      <span key={creator}>
                        <a
                          className="ddb-list-item__creator"
                          href={createPath({
                            url: authorUrl,
                            property: ":author",
                            value: creator
                          })}
                        >
                          {creator}
                        </a>
                        {item.creator[index + 1] ? ", " : " "}
                      </span>
                    );
                  })}
                  {item.year && (
                    <span className="ddb-list-item__year">{item.year}</span>
                  )}
                </p>
              </div>
            </article>
            <aside className="ddb-list-item__buttons">
              <Button
                className="ddb-btn--charcoal ddb-list-item__button--remove"
                onClick={() => onRemove(item.pid)}
              >
                {removeButtonText}
              </Button>
            </aside>
          </section>
        </li>
      ))}
    </UnorderedList>
  );
}

Checklist.defaultProps = {
  items: [],
  loading: "inactive"
};

Checklist.propTypes = {
  loading: PropTypes.oneOf(["inactive", "active", "finished", "failed"]),
  items: PropTypes.arrayOf(
    PropTypes.shape({
      pid: PropTypes.string,
      creators: PropTypes.arrayOf(PropTypes.string),
      title: PropTypes.string,
      type: PropTypes.string,
      year: PropTypes.string,
      coverUrl: urlPropType
    })
  ),
  onRemove: PropTypes.func.isRequired,
  materialUrl: PropTypes.string.isRequired,
  authorUrl: PropTypes.string.isRequired,
  removeButtonText: PropTypes.string.isRequired,
  emptyListText: PropTypes.string.isRequired,
  errorText: PropTypes.string.isRequired
};

export default Checklist;
