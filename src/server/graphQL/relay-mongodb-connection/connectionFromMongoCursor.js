import { getOffsetsFromArgs, getConnectionFromSlice } from './utils';

/**
 * Accepts a mongodb cursor and connection arguments, and returns a connection
 * object for use in GraphQL. It uses array offsets as pagination, so pagination
 * will work only if the data set is static.
 */
export default function connectionFromMongoCursor(inMongoCursor, inArgs, mapper) {
  const args = inArgs || {};
  const mongodbCursor = inMongoCursor.clone();

  return mongodbCursor.count()
    .then((count) => {
      const pagination = getOffsetsFromArgs(args, count);
      const { sort, limit, skip } = pagination;
      const { sortBy, sortOrder } = sort;

      // Short circuit if limit is 0; in that case, mongodb doesn't limit at all
      if (limit === 0) {
        return getConnectionFromSlice([], mapper, args, count, pagination.sort);
      }
      const sortParam = {};
      sortParam[sortBy] = sortOrder;

      // If the supplied slice is too large, trim it down before mapping over it
      mongodbCursor.sort(sortParam);
      mongodbCursor.skip(skip);
      mongodbCursor.limit(limit);

      return mongodbCursor.toArray()
        .then(slice => getConnectionFromSlice(slice, mapper, args, count, pagination.sort));
    });
}
