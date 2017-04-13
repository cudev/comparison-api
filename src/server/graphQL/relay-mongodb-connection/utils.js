function base64(str) {
  return new Buffer(str, 'ascii').toString('base64');
}

function unbase64(b64) {
  return new Buffer(b64, 'base64').toString('ascii');
}
/**
 * Given a position of before or after in paginated array, and
 * default offset, returns the offset to use; if offset is supplied,
 * that will be used, otherwise it will be the default.
 */
function getOffsetWithDefault(offset, defaultOffset) {
  return isNaN(offset) ? defaultOffset : offset;
}

export function getOffsetsFromArgs(inArgs, count) {
  let sort = { sortBy: '_id', sortOrder: 1 };

  const args = inArgs || {};
  let { after, before } = args;
  const { first, last } = args;

  let cursorData;
  if (args.after) {
    cursorData = JSON.parse(unbase64(args.after));
    const { sortBy, sortOrder, position } = cursorData;
    sort = { sortBy, sortOrder };
    after = position;
  }
  if (args.before) {
    cursorData = JSON.parse(unbase64(args.before));
    const { sortBy, sortOrder, position } = cursorData;
    sort = { sortBy, sortOrder };
    before = position;
  }

  const beforeOffset = getOffsetWithDefault(before, count);
  const afterOffset = getOffsetWithDefault(after, -1);

  let startOffset = Math.max(-1, afterOffset) + 1;
  let endOffset = Math.min(count, beforeOffset);

  if (first !== undefined) {
    endOffset = Math.min(endOffset, startOffset + first);
  }
  if (last !== undefined) {
    startOffset = Math.max(startOffset, endOffset - last);
  }

  const skip = Math.max(startOffset, 0);
  const limit = endOffset - startOffset;

  return {
    beforeOffset,
    afterOffset,
    startOffset,
    endOffset,
    sort,
    skip,
    limit,
  };
}

export function getConnectionFromSlice(inSlice, mapper, args, count, sort) {
  const { first, last, after, before } = args;
  const { sortBy, sortOrder } = sort;
  const offsetsFromArgs = getOffsetsFromArgs(args, count);
  const { startOffset, endOffset, beforeOffset, afterOffset } = offsetsFromArgs;

  const slice = typeof mapper === 'function' ? inSlice.map(mapper) : inSlice;

  const edges = slice.map((value, index) => ({
    cursor: base64(JSON.stringify({
      position: startOffset + index,
      sortBy,
      sortOrder,
    })),
    node: value,
  }),
  );

  const firstEdge = edges[0];
  const lastEdge = edges[edges.length - 1];
  const lowerBound = after ? afterOffset + 1 : 0;
  const upperBound = before ? Math.min(beforeOffset, count) : count;

  let hasPreviousPage;

  if (!after) {
    hasPreviousPage = last !== null ? startOffset > lowerBound : false;
  } else {
    hasPreviousPage = true;
  }

  let hasNextPage;

  if (!before) {
    hasNextPage = first !== null ? endOffset < upperBound : false;
  } else {
    hasNextPage = true;
  }

  return {
    edges,
    pageInfo: {
      totalCount: count,
      startCursor: firstEdge ? firstEdge.cursor : null,
      endCursor: lastEdge ? lastEdge.cursor : null,
      hasPreviousPage,
      hasNextPage,
    },
  };
}
