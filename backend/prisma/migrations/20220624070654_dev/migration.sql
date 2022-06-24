-- CreateTable
CREATE TABLE "Channel" (
    "channel_name" TEXT NOT NULL,
    "youtube_id" TEXT NOT NULL PRIMARY KEY,
    "youtube" TEXT,
    "twitter" TEXT,
    "avatar" TEXT,
    "last_updated" DATETIME,
    "group_name" TEXT NOT NULL,
    CONSTRAINT "Channel_group_name_fkey" FOREIGN KEY ("group_name") REFERENCES "Group" ("group_name") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Group" (
    "group_name" TEXT NOT NULL PRIMARY KEY,
    "org_name" TEXT NOT NULL,
    CONSTRAINT "Group_org_name_fkey" FOREIGN KEY ("org_name") REFERENCES "Organization" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Organization" (
    "name" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "Stream" (
    "url" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "live" BOOLEAN NOT NULL,
    "last_updated" DATETIME NOT NULL,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "channel_name" TEXT NOT NULL,
    CONSTRAINT "Stream_channel_name_fkey" FOREIGN KEY ("channel_name") REFERENCES "Channel" ("channel_name") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Channel_channel_name_key" ON "Channel"("channel_name");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_youtube_id_key" ON "Channel"("youtube_id");

-- CreateIndex
CREATE UNIQUE INDEX "Group_group_name_key" ON "Group"("group_name");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_key" ON "Organization"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Stream_url_key" ON "Stream"("url");
